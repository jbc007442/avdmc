export function WelcomeTemplate(name: string) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome</title>
</head>

<body
style="
margin:0;
padding:0;
background:#f4f7fb;
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
box-shadow:0 12px 35px rgba(0,0,0,.08);
">

<!-- HERO -->

<tr>

<td
style="
background:linear-gradient(135deg,#2563eb,#0ea5e9);
padding:60px;
text-align:center;
color:white;
">

<div style="font-size:70px;">
🎉
</div>

<h1
style="
margin:20px 0 10px;
font-size:40px;
">

Welcome!

</h1>

<p
style="
margin:0;
font-size:22px;
">

We're Happy You're Here

</p>

</td>

</tr>

<!-- BODY -->

<tr>

<td
style="
padding:45px;
color:#475569;
font-size:16px;
line-height:1.8;
">

<h2
style="
margin-top:0;
color:#1e293b;
">

Hello ${name},

</h2>

<p>

Thank you for joining us!

We're excited to have you as part of our community.

Our goal is to provide you with the best experience,
exclusive offers, and outstanding support.

</p>

<p>

You can now explore all of our services,
manage your account,
and stay updated with our latest news and promotions.

</p>

</td>

</tr>

<!-- FEATURES -->

<tr>

<td
style="
padding:0 45px 35px;
">

<table width="100%">

<tr>

<td
align="center"
style="
padding:20px;
background:#f8fafc;
border-radius:10px;
">

<div style="font-size:36px;">🚀</div>

<h3>

Fast Service

</h3>

<p>

Quick and Reliable

</p>

</td>

<td width="20"></td>

<td
align="center"
style="
padding:20px;
background:#f8fafc;
border-radius:10px;
">

<div style="font-size:36px;">🔒</div>

<h3>

Secure

</h3>

<p>

Safe & Protected

</p>

</td>

<td width="20"></td>

<td
align="center"
style="
padding:20px;
background:#f8fafc;
border-radius:10px;
">

<div style="font-size:36px;">⭐</div>

<h3>

Premium

</h3>

<p>

Best Experience

</p>

</td>

</tr>

</table>

</td>

</tr>

<!-- CTA -->

<tr>

<td
align="center"
style="
padding-bottom:45px;
">

<a
href="https://avdmc.com"
style="
display:inline-block;
padding:16px 40px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
font-size:18px;
">

Get Started

</a>

</td>

</tr>

<!-- FOOTER -->

<tr>

<td
style="
background:#0f172a;
padding:35px;
text-align:center;
color:#cbd5e1;
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

Thank you for choosing us.

We're excited to serve you.

</p>

<p
style="
font-size:13px;
">

© 2026 AVDMC. All Rights Reserved.

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
