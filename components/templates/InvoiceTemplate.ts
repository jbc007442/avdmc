export function InvoiceTemplate() {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice</title>
</head>

<body
style="
margin:0;
padding:0;
background:#f4f6f9;
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
border-radius:14px;
overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,.08);
">

<!-- HEADER -->

<tr>

<td
style="
background:#2563eb;
padding:35px;
color:white;
">

<table width="100%">

<tr>

<td>

<h1 style="margin:0;">
INVOICE
</h1>

<p style="margin-top:8px;">
Invoice #INV-2026-001
</p>

</td>

<td align="right">

<h2 style="margin:0;">
AVDMC
</h2>

<p style="margin-top:8px;">
www.avdmc.com
</p>

</td>

</tr>

</table>

</td>

</tr>

<!-- CUSTOMER -->

<tr>

<td style="padding:35px;">

<table width="100%">

<tr>

<td>

<h3>Bill To</h3>

<p>

John Smith<br>

john@example.com<br>

New York, USA

</p>

</td>

<td align="right">

<p>

<b>Date:</b> 08 July 2026<br>

<b>Due:</b> 15 July 2026

</p>

</td>

</tr>

</table>

</td>

</tr>

<!-- ITEMS -->

<tr>

<td style="padding:0 35px 35px;">

<table
width="100%"
cellpadding="12"
style="
border-collapse:collapse;
">

<thead>

<tr style="background:#eff6ff;">

<th align="left">
Description
</th>

<th>
Qty
</th>

<th>
Price
</th>

<th>
Total
</th>

</tr>

</thead>

<tbody>

<tr>

<td>Premium Subscription</td>

<td align="center">1</td>

<td align="center">$150</td>

<td align="center">$150</td>

</tr>

<tr>

<td>Hosting Service</td>

<td align="center">1</td>

<td align="center">$50</td>

<td align="center">$50</td>

</tr>

<tr>

<td>Technical Support</td>

<td align="center">2</td>

<td align="center">$25</td>

<td align="center">$50</td>

</tr>

</tbody>

</table>

</td>

</tr>

<!-- TOTAL -->

<tr>

<td style="padding:0 35px 35px;">

<table
align="right"
cellpadding="10"
style="width:280px;">

<tr>

<td>

Subtotal

</td>

<td align="right">

$250

</td>

</tr>

<tr>

<td>

Tax

</td>

<td align="right">

$25

</td>

</tr>

<tr
style="
font-weight:bold;
font-size:20px;
color:#2563eb;
">

<td>

Grand Total

</td>

<td align="right">

$275

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
padding-bottom:40px;
">

<a
href="https://avdmc.com/payment"
style="
display:inline-block;
padding:14px 35px;
background:#16a34a;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
">

Pay Invoice

</a>

</td>

</tr>

<!-- FOOTER -->

<tr>

<td
style="
background:#111827;
padding:30px;
text-align:center;
color:#d1d5db;
">

<p style="margin:0;">

Need help?

support@avdmc.com

</p>

<p style="margin-top:12px;">

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
