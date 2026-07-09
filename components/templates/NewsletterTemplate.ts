export function NewsletterTemplate() {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Newsletter</title>
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
box-shadow:0 10px 30px rgba(0,0,0,.08);
">

<!-- HERO IMAGE -->

<tr>

<td>

<img
src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
width="650"
style="
display:block;
width:100%;
height:auto;
"
/>

</td>

</tr>

<!-- HEADER -->

<tr>

<td
style="
padding:40px;
text-align:center;
">

<h1
style="
margin:0;
font-size:36px;
color:#1e293b;
">

📰 Monthly Newsletter

</h1>

<p
style="
margin-top:15px;
font-size:18px;
color:#64748b;
">

Latest updates, offers and exciting news

</p>

</td>

</tr>

<!-- CONTENT -->

<tr>

<td
style="
padding:0 40px 40px;
">

<table width="100%">

<tr>

<td
style="
padding:20px;
background:#f8fafc;
border-radius:10px;
">

<h2
style="
margin-top:0;
color:#2563eb;
">

🚀 Product Update

</h2>

<p
style="
line-height:1.8;
color:#475569;
">

We have released new features designed to improve
performance, security and user experience.

</p>

</td>

</tr>

</table>

<br>

<table width="100%">

<tr>

<td
style="
padding:20px;
background:#f8fafc;
border-radius:10px;
">

<h2
style="
margin-top:0;
color:#16a34a;
">

🎉 Special Offers

</h2>

<p
style="
line-height:1.8;
color:#475569;
">

Enjoy exclusive discounts available only for newsletter
subscribers.

</p>

</td>

</tr>

</table>

<br>

<table width="100%">

<tr>

<td
style="
padding:20px;
background:#f8fafc;
border-radius:10px;
">

<h2
style="
margin-top:0;
color:#ea580c;
">

📢 Latest News

</h2>

<p
style="
line-height:1.8;
color:#475569;
">

Stay informed about upcoming events,
new services,
and company announcements.

</p>

</td>

</tr>

</table>

<div
style="
text-align:center;
margin-top:40px;
">

<a
href="https://avdmc.com"
style="
display:inline-block;
padding:15px 40px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
">

Read More

</a>

</div>

</td>

</tr>

<!-- SOCIAL -->

<tr>

<td
align="center"
style="
padding:35px;
background:#eff6ff;
">

<h3 style="margin-top:0;">
Stay Connected
</h3>

<p>

Facebook • Instagram • LinkedIn • YouTube

</p>

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
color:#ffffff;
">

AVDMC

</h2>

<p
style="
margin:15px 0;
">

Thank you for subscribing to our newsletter.

</p>

<p
style="
font-size:13px;
">

© 2026 AVDMC. All Rights Reserved.

</p>

<p
style="
font-size:12px;
color:#94a3b8;
">

If you no longer wish to receive these emails,
you can unsubscribe anytime.

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
