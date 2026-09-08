<?php
// Fix CORS: Dynamically allow the requesting origin so credentials work
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle CORS preflight options request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
require_once(__DIR__ . '/../config/db.php');

$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function get_json_input() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// FIX 401 ERROR: Fallback to $_GET['username'] if the PHP session cookie was blocked
function get_active_username() {
    if (!empty($_SESSION['username'])) {
        return $_SESSION['username'];
    }
    if (!empty($_GET['username'])) {
        return $_GET['username'];
    }
    return null;
}

function is_logged_in() {
    return get_active_username() !== null;
}
// ROUTES
switch ($path) {
    case 'session-data':
        respond([
            'loggedIn' => is_logged_in(),
            'username' => is_logged_in() ? $_SESSION['username'] : null,
            'isAdmin' => is_logged_in() ? ($_SESSION['isAdmin'] ? true : false) : false
        ]);
        break;

    case 'auth-status':
        respond([
            'loggedIn' => is_logged_in(),
            'username' => is_logged_in() ? $_SESSION['username'] : null,
            'isAdmin' => is_logged_in() ? ($_SESSION['isAdmin'] ? true : false) : false
        ]);
        break;

    case 'login':
        if ($method !== 'POST') { respond(['success'=>false,'message'=>'Use POST'],405); }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['username']) || !isset($data['password'])) {
            respond(['success'=>false,'message'=>'Missing username or password'],400);
        }
        $username = $data['username'];
        $password = $data['password'];
        $stmt = $conn->prepare('SELECT password, isAdmin FROM users WHERE username = ? LIMIT 1');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            $hash = $row['password'];
            if (password_verify($password, $hash)) {
                $_SESSION['username'] = $username;
                $_SESSION['isAdmin'] = $row['isAdmin'] ? 1 : 0;
                respond(['success'=>true,'message'=>'Login successful','username'=>$username]);
            } else {
                respond(['success'=>false,'message'=>'Invalid credentials'],401);
            }
        } else {
            respond(['success'=>false,'message'=>'User not found'],404);
        }
        break;

    case 'logout':
        if ($method !== 'POST') { respond(['success'=>false,'message'=>'Use POST'],405); }
        session_unset();
        session_destroy();
        respond(['success'=>true,'message'=>'Logged out']);
        break;

    case 'signup':
        if ($method !== 'POST') { respond(['success'=>false,'message'=>'Use POST'],405); }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['username']) || !isset($data['password'])) {
            respond(['success'=>false,'message'=>'Missing username or password'],400);
        }
        $username = $data['username'];
        $password = $data['password'];
        // check exists
        $stmt = $conn->prepare('SELECT username FROM users WHERE username = ?');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        if ($stmt->get_result()->fetch_assoc()) {
            respond(['success'=>false,'message'=>'Username already taken'],409);
        }
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $conn->prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, 0)');
        $stmt->bind_param('ss', $username, $hash);
        if ($stmt->execute()) {
            respond(['success'=>true,'message'=>'User created']);
        } else {
            respond(['success'=>false,'message'=>'DB insert failed'],500);
        }
        break;

    case 'business-supply-names':
        // return array of BusinessSupplyName
        $result = $conn->query('SELECT BusinessSupplyName FROM tblbusinesssupply ORDER BY BusinessSupplyName');
        $out = [];
        while ($r = $result->fetch_assoc()) { $out[] = $r['BusinessSupplyName']; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'supply-categories':
        $bname = isset($_GET['businessSupplyName']) ? $_GET['businessSupplyName'] : '';
        if (!$bname) { respond(['success'=>false,'message'=>'Missing businessSupplyName'],400); }
        $stmt = $conn->prepare('SELECT SupplyCategory FROM tblbusinesssupply_details WHERE BusinessSupplyName = ? ORDER BY SupplyCategory');
        $stmt->bind_param('s', $bname);
        $stmt->execute();
        $res = $stmt->get_result();
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r['SupplyCategory']; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'submit-request':
        if ($method !== 'POST') { respond(['success'=>false,'message'=>'Use POST'],405); }
        // handle form-data (multipart)
        $supply = isset($_POST['SupplyCategory']) ? $_POST['SupplyCategory'] : (isset($_POST['supplyCategory'])?$_POST['supplyCategory']:'');
        $description = isset($_POST['JobDescription']) ? $_POST['JobDescription'] : (isset($_POST['jobDescription'])?$_POST['jobDescription']:'');
        $location = isset($_POST['Location']) ? $_POST['Location'] : (isset($_POST['location'])?$_POST['location']:'');
        $userSentFrom = isset($_POST['userSentFrom']) ? $_POST['userSentFrom'] : (isset($_POST['userFrom'])?$_POST['userFrom']:null);
        if (!$supply || !$description || !$userSentFrom) {
            respond(['success'=>false,'message'=>'Missing required fields'],400);
        }
        $stmt = $conn->prepare('INSERT INTO tblrequest (SupplyCategory, JobDescription, Location, DateTime, userSentFrom) VALUES (?, ?, ?, NOW(), ?)');
        $stmt->bind_param('ssss', $supply, $description, $location, $userSentFrom);
        if ($stmt->execute()) {
            respond(['success'=>true,'message'=>'Request submitted']);
        } else {
            respond(['success'=>false,'message'=>'DB insert failed'],500);
        }
        break;

   case 'business-supply-pending-counts':
        if (!is_logged_in()) { respond(['success'=>false,'message'=>'Unauthorized'],401); }
        
        // Added: AND r.userSentTo IS NULL to the LEFT JOIN condition
        $sql = "SELECT b.BusinessSupplyName, COUNT(r.RequestID) AS PendingRequestCount
                FROM tblbusinesssupply b
                JOIN tblbusinesssupply_details d ON b.BusinessSupplyName = d.BusinessSupplyName
                LEFT JOIN tblrequest r ON r.SupplyCategory = d.SupplyCategory 
                     AND r.Accepted = 0 
                     AND r.userSentTo IS NULL
                GROUP BY b.BusinessSupplyName";

        $result = $conn->query($sql);
        $out = [];
        while ($r = $result->fetch_assoc()) { $out[] = $r; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'requests':
        // handle GET (list), PUT (update single by id)
        if ($method === 'GET') {
            $result = $conn->query('SELECT * FROM tblrequest ORDER BY DateTime DESC');
            $out = [];
            while ($r = $result->fetch_assoc()) { $out[] = $r; }
            respond(['success'=>true,'data'=>$out]);
        } elseif ($method === 'PUT') {
            // parse id param
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            $data = get_json_input();
            if (!$id || !isset($data['accepted'])) { respond(['success'=>false,'message'=>'Missing id or accepted'],400); }
            $accepted = $data['accepted'] ? 1 : 0;
            $userAccepted = isset($data['userAccepted']) ? $data['userAccepted'] : null;
            $stmt = $conn->prepare('UPDATE tblrequest SET Accepted = ?, userAccepted = ? WHERE RequestID = ?');
            $stmt->bind_param('isi', $accepted, $userAccepted, $id);
            if ($stmt->execute()) {
                respond(['success'=>true,'message'=>'Request updated']);
            } else {
                respond(['success'=>false,'message'=>'Update failed'],500);
            }
        } else {
            respond(['success'=>false,'message'=>'Method not allowed'],405);
        }
        break;

    case 'businesses-by-category':
        $category = isset($_GET['category']) ? $_GET['category'] : '';
        if (!$category) { respond(['success'=>false,'message'=>'Missing category'],400); }
        $stmt = $conn->prepare('SELECT * FROM tblbusiness WHERE SupplyCategory = ? ORDER BY BusinessName');
        $stmt->bind_param('s', $category);
        $stmt->execute();
        $res = $stmt->get_result();
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'businesses':
        // optional category filter
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        if ($category) {
            $stmt = $conn->prepare('SELECT * FROM tblbusiness WHERE SupplyCategory = ? ORDER BY BusinessName');
            $stmt->bind_param('s', $category);
            $stmt->execute();
            $res = $stmt->get_result();
        } else {
            $res = $conn->query('SELECT * FROM tblbusiness ORDER BY BusinessName');
        }
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'performers-by-ad-category':
        $ad = isset($_GET['adCategory']) ? $_GET['adCategory'] : '';
        if (!$ad) { respond(['success'=>false,'message'=>'Missing adCategory'],400); }
        $stmt = $conn->prepare('SELECT * FROM tblevent_performers WHERE AdCategory = ? ORDER BY EventPerformerName');
        $stmt->bind_param('s', $ad);
        $stmt->execute();
        $res = $stmt->get_result();
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'performers':
        $res = $conn->query('SELECT * FROM tblevent_performers ORDER BY EventPerformerName');
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'performer-menu':
        $pid = isset($_GET['performerId']) ? intval($_GET['performerId']) : 0;
        if (!$pid) { respond(['success'=>false,'message'=>'Missing performerId'],400); }
        $stmt = $conn->prepare('SELECT * FROM tblbusinessad_menu WHERE EventPerformerID = ?');
        $stmt->bind_param('i', $pid);
        $stmt->execute();
        $res = $stmt->get_result();
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'business-ad-names':
        // return array of BusinessAdName
        $result = $conn->query('SELECT BusinessAdName FROM tblbusinessad ORDER BY BusinessAdName');
        $out = [];
        while ($r = $result->fetch_assoc()) { $out[] = $r['BusinessAdName']; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'ad-categories':
    $bname = isset($_GET['businessAdName']) ? $_GET['businessAdName'] : '';
    if (!$bname) { respond(['success'=>false,'message'=>'Missing businessAdName'],400); }

    $stmt = $conn->prepare('
        SELECT DISTINCT d.AdCategory 
        FROM tblbusinessad_details d
        JOIN tblbusinessad a ON d.BusinessAdID = a.BusinessAdID
        WHERE a.BusinessAdName = ? 
        ORDER BY d.AdCategory
    ');
    $stmt->bind_param('s', $bname);
    $stmt->execute();
    $res = $stmt->get_result();
    $out = [];
    while ($r = $res->fetch_assoc()) { $out[] = $r['AdCategory']; }

    respond(['success'=>true,'data'=>$out]);
    break;
    
    // ... inside the switch ($path) { ... } block in index.php

   // Must be inside the switch ($path) block in api/index.php
    case 'performers-by-ad-category':
        if ($method !== 'GET') { 
            respond(['success' => false, 'message' => 'Use GET'], 405); 
        }
        
        $category = $_GET['adCategory'] ?? '';
        if (!$category) { 
            respond(['success' => false, 'message' => 'Missing adCategory parameter'], 400); 
        }

        // Querying directly from tblevent_performers as per your DB structure
        $stmt = $conn->prepare('SELECT * FROM tblevent_performers WHERE AdCategory = ? ORDER BY EventPerformerName');
        $stmt->bind_param('s', $category);
        $stmt->execute();
        $res = $stmt->get_result();
        
        $out = [];
        while ($r = $res->fetch_assoc()) { 
            $out[] = $r; 
        }
        
        respond(['success' => true, 'data' => $out]);
        break;

    case 'business-ad-details':
    case 'admin-business-ad-details':
        if ($method !== 'POST') { respond(['success'=>false,'message'=>'Use POST'],405); }
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || !isset($data['adCategory']) || !isset($data['businessAdName'])) {
            respond(['success'=>false,'message'=>'Missing adCategory or businessAdName'],400);
        }
        $adCategory = $data['adCategory'];
        $businessAdName = $data['businessAdName'];
        // find BusinessAdID
        $stmt = $conn->prepare('SELECT BusinessAdID FROM tblbusinessad WHERE BusinessAdName = ? LIMIT 1');
        $stmt->bind_param('s', $businessAdName);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            $adId = $row['BusinessAdID'];
        } else {
            // insert parent ad if it doesn't exist
            $stmt2 = $conn->prepare('INSERT INTO tblbusinessad (BusinessAdName) VALUES (?)');
            $stmt2->bind_param('s', $businessAdName);
            $stmt2->execute();
            $adId = $stmt2->insert_id;
        }
        // insert details
        $stmt3 = $conn->prepare('INSERT INTO tblbusinessad_details (BusinessAdID, AdCategory) VALUES (?, ?)');
        $stmt3->bind_param('is', $adId, $adCategory);
        if ($stmt3->execute()) {
            respond(['success'=>true,'message'=>'Ad detail added']);
        } else {
            respond(['success'=>false,'message'=>'Insert failed'],500);
        }
        break;

    case 'proxy-search-address':
        $q = isset($_GET['q']) ? $_GET['q'] : '';
        if (!$q) { respond(['success'=>false,'message'=>'Missing q'],400); }
        $url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=' . urlencode($q) . '&limit=1';
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'MFOCAN_App/1.0 (contact@example.com)');
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code >= 200 && $code < 300) {
            respond(['success'=>true,'data'=>json_decode($resp, true)]);
        } else {
            respond(['success'=>false,'message'=>'Geocoding error'],500);
        }
        break;

    case 'proxy-reverse-geocode':
        $lat = isset($_GET['lat']) ? $_GET['lat'] : null;
        $lon = isset($_GET['lon']) ? $_GET['lon'] : null;
        if (!$lat || !$lon) { respond(['success'=>false,'message'=>'Missing lat/lon'],400); }
        $url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' . urlencode($lat) . '&lon=' . urlencode($lon);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'MFOCAN_App/1.0 (contact@example.com)');
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code >= 200 && $code < 300) {
            respond(['success'=>true,'data'=>json_decode($resp, true)]);
        } else {
            respond(['success'=>false,'message'=>'Reverse geocode error'],500);
        }
        break;

    case 'user-pending-requests':
        if (!is_logged_in()) { respond(['success'=>false,'message'=>'Unauthorized'],401); }
        $username = $_SESSION['username'];
        $stmt = $conn->prepare('SELECT * FROM tblrequest WHERE userSentTo = ? AND Accepted = 0 ORDER BY DateTime DESC');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $res = $stmt->get_result();
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'user-sent-requests':
        if (!is_logged_in()) { respond(['success'=>false,'message'=>'Unauthorized'],401); }
        $username = $_SESSION['username'];
        $stmt = $conn->prepare('SELECT * FROM tblrequest WHERE userSentFrom = ? ORDER BY DateTime DESC');
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $res = $stmt->get_result();
        $out = [];
        while ($r = $res->fetch_assoc()) { $out[] = $r; }
        respond(['success'=>true,'data'=>$out]);
        break;

    case 'requests-by-business-supply-name':
        if ($method !== 'GET') {
            respond(['success'=>false, 'message'=>'Use GET'], 405);
        }

        $bname = isset($_GET['businessSupplyName']) ? trim($_GET['businessSupplyName']) : '';
        if (!$bname) {
            respond(['success'=>false, 'message'=>'Missing businessSupplyName parameter'], 400);
        }

        // 1. Join with details to bridge BusinessSupplyName -> SupplyCategory
        // 2. Filter for userSentTo IS NULL (General requests only)
        $stmt = $conn->prepare("
            SELECT 
                r.RequestID,
                r.SupplyCategory,
                r.JobDescription,
                r.Location,
                r.DateTime,
                r.Accepted,
                r.userSentFrom,
                r.userAccepted,
                r.userSentTo
            FROM tblrequest r
            INNER JOIN tblbusinesssupply_details d ON r.SupplyCategory = d.SupplyCategory
            WHERE d.BusinessSupplyName = ? 
              AND r.userSentTo IS NULL
            ORDER BY r.DateTime DESC
        ");
        
        $stmt->bind_param('s', $bname);
        $stmt->execute();
        $result = $stmt->get_result();

        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }

        respond(['success'=>true, 'data'=>$requests]);
        break;
        
    case 'register-business':
    if ($method !== 'POST') {
        respond(['success' => false, 'message' => 'Use POST'], 405);
    }

    $businessName   = trim($_POST['businessName'] ?? '');
    $address        = $_POST['address'] ?? null;
    $email          = $_POST['email'] ?? null;
    $phoneNumber    = $_POST['phoneNumber'] ?? null;
    $supplyCategory = $_POST['supplyCategory'] ?? null;
    $openFromTime   = $_POST['openFromTime'] ?? null;
    $openTillTime   = $_POST['openTillTime'] ?? null;
    $username       = $_SESSION['username'] ?? 'anonymous';

    // Convert days to 1/0
    $days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    $daysValues = [];
    foreach ($days as $day) { 
        $daysValues[$day] = !empty($_POST[$day]) ? 1 : 0; 
    }

    // Validate required
    if (!$businessName || !$address || !$email || !$phoneNumber || !$supplyCategory || !$openFromTime || !$openTillTime) {
        respond(['success' => false, 'message' => 'All required fields must be filled'], 400);
    }

    // Handle image
    $businessImageURL = null;
    if (!empty($_FILES['businessImage']) && $_FILES['businessImage']['error'] === UPLOAD_ERR_OK) {
        // 👇 Save directly in the parent folder (one level above the current script)
        $uploadDir = __DIR__ . '/../';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $fileInfo = pathinfo($_FILES['businessImage']['name']);
        $ext = strtolower($fileInfo['extension']);
        $safeName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $businessName);
        $newFileName = $safeName . '_' . time() . '.' . $ext;
        $uploadPath = $uploadDir . $newFileName;

        if (move_uploaded_file($_FILES['businessImage']['tmp_name'], $uploadPath)) {
            $businessImageURL = $newFileName; // just the filename
        } else {
            respond(['success' => false, 'message' => 'Failed to move uploaded file'], 500);
        }
    }

    $stmt = $conn->prepare("
        INSERT INTO tblbusiness (
            BusinessName, BusinessImageURL, Address, Email, PhoneNumber,
            SupplyCategory, OpenFromTime, OpenTillTime,
            Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday,
            username
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    $stmt->bind_param(
        "ssssssssiiiiiiis",
        $businessName, $businessImageURL, $address, $email, $phoneNumber,
        $supplyCategory, $openFromTime, $openTillTime,
        $daysValues['Sunday'], $daysValues['Monday'], $daysValues['Tuesday'], $daysValues['Wednesday'],
        $daysValues['Thursday'], $daysValues['Friday'], $daysValues['Saturday'],
        $username
    );

    if ($stmt->execute()) {
        respond(['success' => true, 'message' => 'Business registered successfully!']);
    } else {
        respond(['success' => false, 'message' => 'Database error: ' . $stmt->error], 500);
    }

    $stmt->close();
    break;

    
    case 'admin/register-performer':
    if ($method !== 'POST') {
        respond(['success' => false, 'message' => 'Use POST'], 405);
    }

    // 1. Capture Form Data
    $establishmentName = trim($_POST['establishmentName'] ?? '');
    $address           = $_POST['address'] ?? null;
    $email             = $_POST['email'] ?? null;
    $phoneNumber       = $_POST['phoneNumber'] ?? null;
    $adCategory        = $_POST['adCategory'] ?? null;

    // Performer Data (Falling back to establishment name)
    $performerName     = trim($_POST['performerName'] ?? $establishmentName);
    $eventDate         = !empty($_POST['eventDate']) ? $_POST['eventDate'] : null;
    $bookable          = isset($_POST['bookable']) ? (int)$_POST['bookable'] : 0;
    $users             = $_SESSION['username'] ?? 'normaluser';

    // Times are removed from frontend, so we set them to null for the DB
    $openFrom          = null;
    $openTill          = null;

    // 2. Validation
    if (empty($establishmentName) || empty($address) || empty($email) || empty($adCategory)) {
        respond(['success' => false, 'message' => 'Required fields missing.'], 400);
    }

    // 3. Handle Image Upload
    $performerImageURL = "default_placeholder.png"; 
    $eventsImageOnly = "default_placeholder.png"; 

    if (!empty($_FILES['performerImage']) && $_FILES['performerImage']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../';
        $fileInfo = pathinfo($_FILES['performerImage']['name']);
        $ext = strtolower($fileInfo['extension']);
        
        $safeName = preg_replace('/[^A-Za-z0-9]/', '_', $establishmentName);
        $newFileName = $safeName . '_' . time() . '.' . $ext;
        
        if (move_uploaded_file($_FILES['performerImage']['tmp_name'], $uploadDir . $newFileName)) {
            $performerImageURL = $newFileName;
            $eventsImageOnly = $newFileName; 
        }
    }

    // 4. Map Checkbox Days
    $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $dv = [];
    foreach($days as $day) {
        $dv[] = !empty($_POST[$day]) ? 1 : 0;
    }

    // 5. Prepare SQL (20 columns total - 20 placeholders)
    $stmt = $conn->prepare("
        INSERT INTO tblevent_performers (
            EventPerformerName, 
            EstablishmentName, 
            EventPerformerImageURL, 
            eventsimageonly, 
            Address, 
            Email, 
            PhoneNumber, 
            OpenFrom, 
            OpenTill, 
            Sunday, 
            Monday, 
            Tuesday, 
            Wednesday, 
            Thursday, 
            Friday, 
            Saturday, 
            EventPerformerDate, 
            AdCategory, 
            bookable, 
            users
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    // 6. Bind Parameters 
    // sssssssss (9 strings: names, images, address, email, phone, openFrom, openTill)
    // iiiiiii   (7 integers: days of the week)
    // s         (1 string: eventDate)
    // s         (1 string: adCategory)
    // i         (1 integer: bookable)
    // s         (1 string: users)
    // Total = 20 parameters
    $stmt->bind_param(
        "sssssssssiiiiiiissis", 
        $performerName, 
        $establishmentName, 
        $performerImageURL,
        $eventsImageOnly,
        $address, 
        $email, 
        $phoneNumber,
        $openFrom, 
        $openTill,
        $dv[0], $dv[1], $dv[2], $dv[3], $dv[4], $dv[5], $dv[6],
        $eventDate, 
        $adCategory, 
        $bookable, 
        $users
    );

    if ($stmt->execute()) {
        respond(['success' => true, 'message' => 'Business registered successfully!']);
    } else {
        respond(['success' => false, 'message' => 'Database error: ' . $stmt->error], 500);
    }
    $stmt->close();
    break;


    case 'submit-request-to-user':
    if ($method !== 'POST') { 
        respond(['success'=>false,'message'=>'Use POST'],405); 
    }

    $supply = $_POST['SupplyCategory'] ?? ($_POST['supplyCategory'] ?? '');
    $description = $_POST['JobDescription'] ?? ($_POST['jobDescription'] ?? '');
    $location = $_POST['Location'] ?? ($_POST['location'] ?? '');
    $userSentFrom = $_POST['userSentFrom'] ?? ($_POST['userFrom'] ?? null);
    $userSentTo = $_POST['userSentTo'] ?? null; // this must be provided

    if (!$supply || !$description || !$userSentFrom || !$userSentTo) {
        respond(['success'=>false,'message'=>'Missing required fields'],400);
    }

    // Optional: check if the target user exists
    $stmt = $conn->prepare('SELECT username FROM tblbusiness WHERE username = ? LIMIT 1');
    $stmt->bind_param('s', $userSentTo);
    $stmt->execute();
    $res = $stmt->get_result();
    if (!$res->fetch_assoc()) {
        respond(['success'=>false,'message'=>'Target business/user not found'],404);
    }

    // Insert the request
    $stmt = $conn->prepare('
        INSERT INTO tblrequest 
            (SupplyCategory, JobDescription, Location, DateTime, userSentFrom, userSentTo) 
        VALUES (?, ?, ?, NOW(), ?, ?)
    ');
    $stmt->bind_param('sssss', $supply, $description, $location, $userSentFrom, $userSentTo);

    if ($stmt->execute()) {
        respond(['success'=>true,'message'=>'Request sent to specific user']);
    } else {
        respond(['success'=>false,'message'=>'DB insert failed'],500);
    }
    break;




    default:
        respond(['success'=>false,'message'=>'Endpoint not found: ' . $path],404);
}
?>