<?php
/**
 * contact.php — Contact form handler
 * Justine Rose E. Dominggono Portfolio
 *
 * Receives a POST request from the contact form,
 * validates input, and sends an email notification.
 *
 * Requirements: PHP 7.4+, mail() configured on the server
 *               (or swap in PHPMailer / SMTP for production).
 */

declare(strict_types=1);

// ── Configuration ────────────────────────────────────────────
const RECIPIENT_EMAIL = 'justineroseedominggono@gmail.com';
const RECIPIENT_NAME  = 'Justine Rose E. Dominggono';
const SUBJECT_PREFIX  = '[Portfolio Contact]';
const MAX_MESSAGE_LEN = 5000;

// ── Helpers ──────────────────────────────────────────────────

/**
 * Send a JSON response and exit.
 */
function jsonResponse(bool $success, string $message, int $httpCode = 200): void
{
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

/**
 * Sanitize a plain-text field.
 */
function sanitizeText(string $value): string
{
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

// ── CORS / Method guard ───────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.', 405);
}

// ── Rate limiting (simple session-based) ─────────────────────
session_start();
$now = time();
$window = 60;       // seconds
$maxRequests = 3;   // max submissions per window

if (!isset($_SESSION['contact_times'])) {
    $_SESSION['contact_times'] = [];
}

// Remove timestamps outside the window
$_SESSION['contact_times'] = array_filter(
    $_SESSION['contact_times'],
    fn($t) => ($now - $t) < $window
);

if (count($_SESSION['contact_times']) >= $maxRequests) {
    jsonResponse(false, 'Too many requests. Please wait a moment and try again.', 429);
}

$_SESSION['contact_times'][] = $now;

// ── Input validation ─────────────────────────────────────────
$name    = sanitizeText($_POST['name']    ?? '');
$email   = sanitizeText($_POST['email']   ?? '');
$subject = sanitizeText($_POST['subject'] ?? 'No subject');
$message = sanitizeText($_POST['message'] ?? '');

$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required.';
} elseif (mb_strlen($name) > 100) {
    $errors[] = 'Name must be 100 characters or fewer.';
}

if (empty($email)) {
    $errors[] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address.';
}

if (empty($message)) {
    $errors[] = 'Message is required.';
} elseif (mb_strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
} elseif (mb_strlen($message) > MAX_MESSAGE_LEN) {
    $errors[] = 'Message is too long (max ' . MAX_MESSAGE_LEN . ' characters).';
}

if (!empty($errors)) {
    jsonResponse(false, implode(' ', $errors), 422);
}

// ── Honeypot spam check ───────────────────────────────────────
// Add a hidden field named "website" to the HTML form.
// Bots fill it; humans leave it empty.
if (!empty($_POST['website'])) {
    // Silently succeed to not tip off bots
    jsonResponse(true, 'Message received.');
}

// ── Build email ───────────────────────────────────────────────
$emailSubject = SUBJECT_PREFIX . ' ' . $subject;

$emailBody = <<<TEXT
You have received a new message from your portfolio contact form.

---
Name:    {$name}
Email:   {$email}
Subject: {$subject}
---

{$message}

---
Sent at: {$now} UTC
IP:      {$_SERVER['REMOTE_ADDR']}
TEXT;

$headers  = "From: Portfolio Contact Form <no-reply@portfolio.local>\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

// ── Send ──────────────────────────────────────────────────────
$sent = mail(RECIPIENT_EMAIL, $emailSubject, $emailBody, $headers);

if ($sent) {
    jsonResponse(true, 'Your message has been sent successfully!');
} else {
    // mail() failed — log server-side, return generic error to client
    error_log("[Portfolio] mail() failed for sender: {$email}");
    jsonResponse(false, 'Could not send the message. Please email me directly.', 500);
}
