"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_document";
exports.ids = ["pages/_document"];
exports.modules = {

/***/ "./src/pages/_document.tsx":
/*!*********************************!*\
  !*** ./src/pages/_document.tsx ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var next_document__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/document */ \"./node_modules/next/document.js\");\n/* harmony import */ var next_document__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_document__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styled-components */ \"styled-components\");\n/* harmony import */ var styled_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(styled_components__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__);\nvar _jsxFileName = \"C:\\\\Users\\\\david\\\\Documents\\\\GitHub\\\\RPS\\\\src\\\\pages\\\\_document.tsx\";\nfunction ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }\nfunction _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }\nfunction _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\nfunction _toPropertyKey(arg) { var key = _toPrimitive(arg, \"string\"); return typeof key === \"symbol\" ? key : String(key); }\nfunction _toPrimitive(input, hint) { if (typeof input !== \"object\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \"default\"); if (typeof res !== \"object\") return res; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (hint === \"string\" ? String : Number)(input); }\n\n\n\n\nclass MyDocument extends (next_document__WEBPACK_IMPORTED_MODULE_0___default()) {\n  static async getInitialProps(ctx) {\n    const sheet = new styled_components__WEBPACK_IMPORTED_MODULE_1__.ServerStyleSheet();\n    const originalRenderPage = ctx.renderPage;\n    try {\n      ctx.renderPage = () => originalRenderPage({\n        enhanceApp: App => props => sheet.collectStyles( /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(App, _objectSpread({}, props), void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 13,\n          columnNumber: 33\n        }, this))\n      });\n      const initialProps = await next_document__WEBPACK_IMPORTED_MODULE_0___default().getInitialProps(ctx);\n      return _objectSpread(_objectSpread({}, initialProps), {}, {\n        styles: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.Fragment, {\n          children: [initialProps.styles, sheet.getStyleElement()]\n        }, void 0, true)\n      });\n    } finally {\n      sheet.seal();\n    }\n  }\n  render() {\n    return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_0__.Html, {\n      children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_0__.Head, {\n        children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(\"link\", {\n          rel: \"preconnect\",\n          href: \"https://fonts.googleapis.com\"\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 35,\n          columnNumber: 11\n        }, this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(\"link\", {\n          rel: \"preconnect\",\n          href: \"https://fonts.gstatic.com\",\n          crossOrigin: \"anonymous\"\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 36,\n          columnNumber: 11\n        }, this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(\"link\", {\n          href: \"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800&display=swap\",\n          rel: \"stylesheet\"\n        }, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 37,\n          columnNumber: 11\n        }, this)]\n      }, void 0, true, {\n        fileName: _jsxFileName,\n        lineNumber: 34,\n        columnNumber: 9\n      }, this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(\"body\", {\n        children: [/*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_0__.Main, {}, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 40,\n          columnNumber: 11\n        }, this), /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_2__.jsxDEV)(next_document__WEBPACK_IMPORTED_MODULE_0__.NextScript, {}, void 0, false, {\n          fileName: _jsxFileName,\n          lineNumber: 41,\n          columnNumber: 11\n        }, this)]\n      }, void 0, true, {\n        fileName: _jsxFileName,\n        lineNumber: 39,\n        columnNumber: 9\n      }, this)]\n    }, void 0, true, {\n      fileName: _jsxFileName,\n      lineNumber: 33,\n      columnNumber: 7\n    }, this);\n  }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (MyDocument);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2RvY3VtZW50LnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXdGO0FBQ25DO0FBQUE7QUFBQTtBQUVyRCxNQUFNVSxVQUFVLFNBQVNWLHNEQUFRLENBQUM7RUFDaEMsYUFBYVcsZUFBZUEsQ0FBQ0MsR0FBb0IsRUFBRTtJQUNqRCxNQUFNQyxLQUFLLEdBQUcsSUFBSVIsK0RBQWdCLENBQUMsQ0FBQztJQUNwQyxNQUFNUyxrQkFBa0IsR0FBR0YsR0FBRyxDQUFDRyxVQUFVO0lBRXpDLElBQUk7TUFDRkgsR0FBRyxDQUFDRyxVQUFVLEdBQUcsTUFDZkQsa0JBQWtCLENBQUM7UUFDakJFLFVBQVUsRUFBR0MsR0FBRyxJQUFNQyxLQUFLLElBQ3pCTCxLQUFLLENBQUNNLGFBQWEsZUFBQ1osNkRBQUEsQ0FBQ1UsR0FBRyxFQUFBRyxhQUFBLEtBQUtGLEtBQUs7VUFBQUcsUUFBQSxFQUFBQyxZQUFBO1VBQUFDLFVBQUE7VUFBQUMsWUFBQTtRQUFBLE9BQUcsQ0FBQztNQUMxQyxDQUFDLENBQUM7TUFFSixNQUFNQyxZQUFZLEdBQUcsTUFBTXpCLG9FQUF3QixDQUFDWSxHQUFHLENBQUM7TUFDeEQsT0FBQVEsYUFBQSxDQUFBQSxhQUFBLEtBQ0tLLFlBQVk7UUFDZkMsTUFBTSxlQUNKbkIsNkRBQUEsQ0FBQUUsMkRBQUE7VUFBQWtCLFFBQUEsR0FDR0YsWUFBWSxDQUFDQyxNQUFNLEVBQ25CYixLQUFLLENBQUNlLGVBQWUsQ0FBQyxDQUFDO1FBQUEsZUFDeEI7TUFDSDtJQUVMLENBQUMsU0FBUztNQUNSZixLQUFLLENBQUNnQixJQUFJLENBQUMsQ0FBQztJQUNkO0VBQ0Y7RUFFQUMsTUFBTUEsQ0FBQSxFQUFHO0lBQ1Asb0JBQ0V2Qiw2REFBQSxDQUFDTiwrQ0FBSTtNQUFBMEIsUUFBQSxnQkFDSHBCLDZEQUFBLENBQUNMLCtDQUFJO1FBQUF5QixRQUFBLGdCQUNIcEIsNkRBQUE7VUFBTXdCLEdBQUcsRUFBQyxZQUFZO1VBQUNDLElBQUksRUFBQztRQUE4QjtVQUFBWCxRQUFBLEVBQUFDLFlBQUE7VUFBQUMsVUFBQTtVQUFBQyxZQUFBO1FBQUEsT0FBRSxDQUFDLGVBQzdEakIsNkRBQUE7VUFBTXdCLEdBQUcsRUFBQyxZQUFZO1VBQUNDLElBQUksRUFBQywyQkFBMkI7VUFBQ0MsV0FBVyxFQUFDO1FBQVc7VUFBQVosUUFBQSxFQUFBQyxZQUFBO1VBQUFDLFVBQUE7VUFBQUMsWUFBQTtRQUFBLE9BQUUsQ0FBQyxlQUNsRmpCLDZEQUFBO1VBQU15QixJQUFJLEVBQUMsaUhBQWlIO1VBQUNELEdBQUcsRUFBQztRQUFZO1VBQUFWLFFBQUEsRUFBQUMsWUFBQTtVQUFBQyxVQUFBO1VBQUFDLFlBQUE7UUFBQSxPQUFFLENBQUM7TUFBQTtRQUFBSCxRQUFBLEVBQUFDLFlBQUE7UUFBQUMsVUFBQTtRQUFBQyxZQUFBO01BQUEsT0FDNUksQ0FBQyxlQUNQakIsNkRBQUE7UUFBQW9CLFFBQUEsZ0JBQ0VwQiw2REFBQSxDQUFDSiwrQ0FBSTtVQUFBa0IsUUFBQSxFQUFBQyxZQUFBO1VBQUFDLFVBQUE7VUFBQUMsWUFBQTtRQUFBLE9BQUUsQ0FBQyxlQUNSakIsNkRBQUEsQ0FBQ0gscURBQVU7VUFBQWlCLFFBQUEsRUFBQUMsWUFBQTtVQUFBQyxVQUFBO1VBQUFDLFlBQUE7UUFBQSxPQUFFLENBQUM7TUFBQTtRQUFBSCxRQUFBLEVBQUFDLFlBQUE7UUFBQUMsVUFBQTtRQUFBQyxZQUFBO01BQUEsT0FDVixDQUFDO0lBQUE7TUFBQUgsUUFBQSxFQUFBQyxZQUFBO01BQUFDLFVBQUE7TUFBQUMsWUFBQTtJQUFBLE9BQ0gsQ0FBQztFQUVYO0FBQ0Y7QUFFQSxpRUFBZWQsVUFBVSIsInNvdXJjZXMiOlsid2VicGFjazovL3JvY2stcGFwZXItc29sYW5hLy4vc3JjL3BhZ2VzL19kb2N1bWVudC50c3g/MTg4ZSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRG9jdW1lbnQsIHsgSHRtbCwgSGVhZCwgTWFpbiwgTmV4dFNjcmlwdCwgRG9jdW1lbnRDb250ZXh0IH0gZnJvbSAnbmV4dC9kb2N1bWVudCc7XHJcbmltcG9ydCB7IFNlcnZlclN0eWxlU2hlZXQgfSBmcm9tICdzdHlsZWQtY29tcG9uZW50cyc7XHJcblxyXG5jbGFzcyBNeURvY3VtZW50IGV4dGVuZHMgRG9jdW1lbnQge1xyXG4gIHN0YXRpYyBhc3luYyBnZXRJbml0aWFsUHJvcHMoY3R4OiBEb2N1bWVudENvbnRleHQpIHtcclxuICAgIGNvbnN0IHNoZWV0ID0gbmV3IFNlcnZlclN0eWxlU2hlZXQoKTtcclxuICAgIGNvbnN0IG9yaWdpbmFsUmVuZGVyUGFnZSA9IGN0eC5yZW5kZXJQYWdlO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGN0eC5yZW5kZXJQYWdlID0gKCkgPT5cclxuICAgICAgICBvcmlnaW5hbFJlbmRlclBhZ2Uoe1xyXG4gICAgICAgICAgZW5oYW5jZUFwcDogKEFwcCkgPT4gKHByb3BzKSA9PlxyXG4gICAgICAgICAgICBzaGVldC5jb2xsZWN0U3R5bGVzKDxBcHAgey4uLnByb3BzfSAvPiksXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBpbml0aWFsUHJvcHMgPSBhd2FpdCBEb2N1bWVudC5nZXRJbml0aWFsUHJvcHMoY3R4KTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICAuLi5pbml0aWFsUHJvcHMsXHJcbiAgICAgICAgc3R5bGVzOiAoXHJcbiAgICAgICAgICA8PlxyXG4gICAgICAgICAgICB7aW5pdGlhbFByb3BzLnN0eWxlc31cclxuICAgICAgICAgICAge3NoZWV0LmdldFN0eWxlRWxlbWVudCgpfVxyXG4gICAgICAgICAgPC8+XHJcbiAgICAgICAgKSxcclxuICAgICAgfTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNoZWV0LnNlYWwoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbmRlcigpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxIdG1sPlxyXG4gICAgICAgIDxIZWFkPlxyXG4gICAgICAgICAgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiIGhyZWY9XCJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tXCIgLz5cclxuICAgICAgICAgIDxsaW5rIHJlbD1cInByZWNvbm5lY3RcIiBocmVmPVwiaHR0cHM6Ly9mb250cy5nc3RhdGljLmNvbVwiIGNyb3NzT3JpZ2luPVwiYW5vbnltb3VzXCIgLz5cclxuICAgICAgICAgIDxsaW5rIGhyZWY9XCJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PUludGVyOndnaHRANDAwOzUwMDs2MDA7NzAwJmZhbWlseT1Nb250c2VycmF0OndnaHRANzAwOzgwMCZkaXNwbGF5PXN3YXBcIiByZWw9XCJzdHlsZXNoZWV0XCIgLz5cclxuICAgICAgICA8L0hlYWQ+XHJcbiAgICAgICAgPGJvZHk+XHJcbiAgICAgICAgICA8TWFpbiAvPlxyXG4gICAgICAgICAgPE5leHRTY3JpcHQgLz5cclxuICAgICAgICA8L2JvZHk+XHJcbiAgICAgIDwvSHRtbD5cclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNeURvY3VtZW50OyAiXSwibmFtZXMiOlsiRG9jdW1lbnQiLCJIdG1sIiwiSGVhZCIsIk1haW4iLCJOZXh0U2NyaXB0IiwiU2VydmVyU3R5bGVTaGVldCIsImpzeERFViIsIl9qc3hERVYiLCJGcmFnbWVudCIsIl9GcmFnbWVudCIsIk15RG9jdW1lbnQiLCJnZXRJbml0aWFsUHJvcHMiLCJjdHgiLCJzaGVldCIsIm9yaWdpbmFsUmVuZGVyUGFnZSIsInJlbmRlclBhZ2UiLCJlbmhhbmNlQXBwIiwiQXBwIiwicHJvcHMiLCJjb2xsZWN0U3R5bGVzIiwiX29iamVjdFNwcmVhZCIsImZpbGVOYW1lIiwiX2pzeEZpbGVOYW1lIiwibGluZU51bWJlciIsImNvbHVtbk51bWJlciIsImluaXRpYWxQcm9wcyIsInN0eWxlcyIsImNoaWxkcmVuIiwiZ2V0U3R5bGVFbGVtZW50Iiwic2VhbCIsInJlbmRlciIsInJlbCIsImhyZWYiLCJjcm9zc09yaWdpbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/_document.tsx\n");

/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "styled-components":
/*!************************************!*\
  !*** external "styled-components" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("styled-components");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("./src/pages/_document.tsx")));
module.exports = __webpack_exports__;

})();