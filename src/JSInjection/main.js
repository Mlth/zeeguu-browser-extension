/*global chrome*/
import {removeSVG} from "./removesvg";
import {cleanImages} from "./cleanImages";
import {CanWeReturnJSX} from "./test.js";
import ReactDom from "react-dom";

/* Changes to current URL's DOM */
chrome.storage.local.get("isProbablyReaderable", function (data) {
  console.log(data);
  if (!data.isProbablyReaderable) {
    console.log("This content is not readable");
    alert("This content is not readable");
  } else {
    console.log("YES! This content is readable");
    let dataText;
    chrome.storage.local.get("article", function (data) {
      if (data.article === undefined) {
        console.log("No article is defined");
      } else {
        dataText = data.article
        console.log(dataText)
        const cleanContent = cleanImages(dataText.content);
        const cleanSVG = removeSVG(cleanContent);
       // make container for jsx:
        const dialog = document.createElement('dialog');
        dialog.id = "myDialog";
        dialog.setAttribute("class", "modal");
        document.body.appendChild(dialog);

        ReactDom.render(
          CanWeReturnJSX(dataText.title, cleanSVG),
          dialog
        );
        


        //  const cleanContent = cleanImages(dataText.content);
        //  const cleanSVG = removeSVG(cleanContent);
        //  let dialogWindow = document.createElement("dialog");
        //  let dialogContent = document.createElement("div");
        //  dialogContent.setAttribute("class", "modal-content");

        //  var xClose = document.createElement("span");
        //  xClose.setAttribute("id", "qtClose");
        //  xClose.setAttribute("role", "button");
        //  xClose.textContent = "X";

        //  let div = document.createElement("div");
        //  div.innerHTML = cleanSVG; 
        //  div.setAttribute("style", `width: 95%`);

        //  let h1 = document.createElement("h1");
        //  let headline = document.createTextNode(dataText.title);
        //  h1.appendChild(headline);

        //  dialogWindow.setAttribute("id", "myDialog");
        //  dialogWindow.setAttribute("class", "modal");

        //  dialogWindow.appendChild(xClose);
        //  dialogWindow.appendChild(dialogContent);
        //  dialogContent.appendChild(h1);
        //  dialogContent.appendChild(div);

        //  document.body.appendChild(dialogWindow);
        //  document.getElementById("myDialog").showModal();
        //  document.body.style.overflow = "hidden";

        //  let button = document.getElementById("qtClose");
        //  button.addEventListener("click", function () {
        //    document.body.style.overflow = "auto";
        //    document.getElementById("myDialog").close();
        //  });

        //  

      }
    });
  }
});


/* Event listeners */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    document.body.style.overflow = "auto";
  }
});


