export const materialViewerHeader = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,300;0,400;0,600;1,400&display=swap" rel="stylesheet">
<link rel='stylesheet' href='https://necolas.github.io/normalize.css/8.0.1/normalize.css'/>
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
* {
    font-family: 'Nunito Sans', sans-serif!important;
    text-align:left!important;
    color:white!important;
}
h3.sppb-addon-title{
    font-size:1.8rem;
}
div[itemprop="articleBody"]{
    padding:1.5rem!important;
}

div.os-cat-tab-images > div {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
}
div.os-cat-tab-images > div {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-around;
}

div.img-block img {
    width:300px!important;
    height:180px!important;
    border-radius:1.2rem;
    filter: grayscale(40%);
}
div:has(div.os-cat-tab-images) li a {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    font-weight:600;
    font-size:1.8rem;
}

a:link {
    text-decoration: none;
}

a:visited {
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}

a:active {
    text-decoration: none;
}

div:has(div.os-cat-tab-images) ul {
    list-style-type: none;
}


html{
    background:black;
}

div.sppb-addon{
    background:rgba(0,0,0,0.6);
    border-radius:1.4rem;
    padding:1rem;
}

body {
    background: linear-gradient(rgba(0, 0, 0, 0.70), rgba(0, 0, 0, 0.70)), url('https://happywall-img-gallery.imgix.net/229/bocker_svartvit_display.jpg');
    background-attachment: fixed;
    background-size: cover;
}
</style>

<style>
div.yrvote_box{
    display:none;
}
html > script:nth-child(1){
    display:none;
}
footer{
    display:none;
}
header{
    display:none;
}
ul.tags{
    display:none;
}
nav{
    display:none;
}
div.jo-whatsappcontactbutton{
    display:none;
}
.offcanvas-menu{
    display:none;
}
.offcanvas-overlay{
    display:none;
}
</sctyle>





`

export const materialViewerBody = `
<script>
updPage();

function updPage(){
    document.querySelectorAll("img[data-src]").forEach((element)=>{
        console.log(element)
            element.setAttribute('src',element.getAttribute("data-src"));
    })

    document.querySelector("div.os-cat-tab-images > div").style="";
}
</script>
`