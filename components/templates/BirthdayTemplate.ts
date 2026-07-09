export function BirthdayTemplate(name: string) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>Happy Birthday</title>
</head>

<body
style="
margin:0;
padding:0;
background:#f3f4f6;
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
width="600"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:18px;
overflow:hidden;
box-shadow:0 10px 35px rgba(0,0,0,.08);
"
>

<tr>

<td
style="
background:linear-gradient(135deg,#ff5f6d,#ffc371);
padding:50px;
text-align:center;
color:#fff;
"
>

<div style="font-size:70px;">🎉</div>

<h1
style="
margin:20px 0 10px;
font-size:36px;
font-weight:bold;
"
>
Happy Birthday!
</h1>

<p
style="
font-size:20px;
margin:0;
"
>
Dear ${name}
</p>

</td>

</tr>

<tr>

<td
style="
padding:45px;
color:#374151;
font-size:16px;
line-height:1.8;
"
>

<p>

Wishing you a wonderful birthday filled with happiness,
good health, success, and unforgettable moments.

</p>

<p>

May this new year of your life bring exciting
opportunities, prosperity, and endless joy.

</p>

<div
style="
margin:40px 0;
text-align:center;
"
>

<a
href="https://avdmc.com"
style="
display:inline-block;
padding:14px 35px;
background:#2563eb;
color:#fff;
text-decoration:none;
border-radius:8px;
font-weight:bold;
"
>

Visit Our Website

</a>

</div>

<table
width="100%"
style="
background:#fff8e6;
border-radius:12px;
padding:20px;
"
>

<tr>

<td
align="center"
style="
font-size:18px;
font-weight:bold;
color:#f59e0b;
"
>

🎂 Enjoy your special day! 🎂

</td>

</tr>

</table>

</td>

</tr>

<tr>

<td
style="
background:#111827;
padding:30px;
text-align:center;
color:#d1d5db;
font-size:14px;
"
>

<p style="margin:0;">
Warm wishes from
</p>

<h2
style="
margin:10px 0;
color:#ffffff;
"
>

AVDMC Team

</h2>

<p style="margin:0;">
https://avdmc.com
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
