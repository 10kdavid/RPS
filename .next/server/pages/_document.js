"use strict";(()=>{var e={};e.id=660,e.ids=[660],e.modules={8904:(e,t,r)=>{r.r(t),r.d(t,{default:()=>l});var s=r(6859),n=r.n(s),o=r(7518),i=r(997);function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);t&&(s=s.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,s)}return r}function a(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach(function(t){var s,n;s=t,n=r[t],(s=function(e){var t=function(e,t){if("object"!=typeof e||null===e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var s=r.call(e,t||"default");if("object"!=typeof s)return s;throw TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:String(t)}(s))in e?Object.defineProperty(e,s,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[s]=n}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}class l extends n(){static async getInitialProps(e){let t=new o.ServerStyleSheet,r=e.renderPage;try{e.renderPage=()=>r({enhanceApp:e=>r=>t.collectStyles(i.jsx(e,a({},r)))});let s=await n().getInitialProps(e);return a(a({},s),{},{styles:[s.styles,t.getStyleElement()]})}finally{t.seal()}}render(){return(0,i.jsxs)(s.Html,{lang:"en",children:[(0,i.jsxs)(s.Head,{children:[i.jsx("meta",{charSet:"utf-8"}),i.jsx("meta",{httpEquiv:"Content-Security-Policy",content:`
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline';
            img-src 'self' data: blob: https:;
            font-src 'self' data:;
            connect-src 'self' 
              https://mainnet.helius-rpc.com
              https://*.solana.com
              https://solana-api.projectserum.com
              https://www.crossmint.com
              https://*.crossmint.com
              wss://api.mainnet-beta.solana.com 
              wss://*.solana.com;
            frame-src 'self';
            object-src 'none';
          `}),i.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),i.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),i.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800&display=swap",rel:"stylesheet"})]}),(0,i.jsxs)("body",{children:[i.jsx(s.Main,{}),i.jsx(s.NextScript,{})]})]})}}},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},6689:e=>{e.exports=require("react")},997:e=>{e.exports=require("react/jsx-runtime")},7518:e=>{e.exports=require("styled-components")},5315:e=>{e.exports=require("path")}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[635,859],()=>r(8904));module.exports=s})();