export function PasswordResetTemplate(resetLink: string) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Password Reset</title>
</head>

<body
style="
margin:0;
padding:0;
background:#f4f6fb;
font-family:Arial,Helvetica,sans-serif;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="padding:40px 0;"
>

<tr>

<td align="center">

<table
width="650"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:18px;
overflow:hidden;
box-shadow:0 12px 30px rgba(0,0,0,.08);
">

<!-- HEADER -->

<tr>

<td
style="
background:#2563eb;
padding:55px;
text-align:center;
color:white;
">

<div style="font-size:70px;">
🔐
</div>

<h1
style="
margin:20px 0 10px;
font-size:36px;
">

Password Reset

</h1>

<p
style="
margin:0;
font-size:18px;
">

Reset your account password

</p>

</td>

</tr>

<!-- BODY -->

<tr>

<td
style="
padding:45px;
font-size:16px;
line-height:1.8;
color:#475569;
">

<p>

Hello,

</p>

<p>

We received a request to reset your account password.

If you made this request, click the button below to create a new password.

</p>

<div
style="
text-align:center;
margin:40px 0;
">

<a
href="${resetLink}"
style="
display:inline-block;
padding:15px 40px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-size:18px;
font-weight:bold;
">

Reset Password

</a>

</div>

<p>

This password reset link will expire in
<strong>30 minutes</strong>.

</p>

<p>

If you did not request a password reset,
you can safely ignore this email.
Your account remains secure.

</p>

</td>

</tr>

<!-- SECURITY -->

<tr>

<td
style="
background:#eff6ff;
padding:35px;
">

<h2
style="
margin-top:0;
color:#2563eb;
">

🛡 Security Tips

</h2>

<ul
style="
line-height:2;
color:#475569;
padding-left:20px;
">

<li>Never share your password.</li>

<li>Use a strong password.</li>

<li>Enable Two-Factor Authentication.</li>

<li>Do not share this reset link.</li>

</ul>

</td>

</tr>

<!-- FOOTER -->

<tr>

<td
style="
background:#111827;
padding:35px;
text-align:center;
color:#d1d5db;
">

<h2
style="
margin:0;
color:white;
">

AVDMC

</h2>

<p
style="
margin:15px 0;
">

This is an automated email.

Please do not reply.

</p>

<p
style="
font-size:13px;
">

© 2026 AVDMC

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
}
