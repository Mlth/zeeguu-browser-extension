/*global chrome*/
import { Modal } from "./Modal/Modal";
import ReactDOM from "react-dom";
import { useState, useEffect } from "react";
import {
  deleteCurrentDOM,
  getSourceAsDOM,
  getSessionId,
  deleteEvents,
} from "../popup/functions";
import { Article } from "./Modal/Article";
import { generalClean } from "./Cleaning/generelClean";
import {
  cleanAfterArray,
  cleanDOMAfter,
  individualClean,
} from "./Cleaning/pageSpecificClean";
import Zeeguu_API from "../zeeguu-react/src/api/Zeeguu_API";
import DOMPurify from "dompurify";
import ZeeguuLoader from "./ZeeguuLoader";
import { addElements, drRegex, saveElements } from "./Cleaning/Pages/dr";
import { API_URL } from "../config";
import ZeeguuError from "./ZeeguuError";
import { isProbablyReaderable } from "@mozilla/readability";
import { checkReadability } from "../popup/checkReadability";
import { checkLanguageSupportFromUrl } from "../popup/functions";

export function Main({ documentFromTab, url }) {
  let api = new Zeeguu_API(API_URL);

  const [article, setArticle] = useState();
  const [sessionId, setSessionId] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [isReadable, setIsReadable] = useState();
  const [languageSupported, setLanguageSupported] = useState();
  const [isAPIDown, setIsAPIDown] = useState();
  const [foundError, setFoundError] = useState();
  const minLength = 120;
  const minScore = 20;

  if (!documentFromTab) {
    // No internet
    return (
      <ZeeguuError
        isNotReadable={!isReadable}
        isNotLanguageSupported={!languageSupported}
        isMissingSession={sessionId === undefined}
        isZeeguuAPIDown={false}
        isInternetDown={true}
        api={api}
      />
    );
  }

  useEffect(() => {
    getSessionId().then(
      (sessionId) => {
        setSessionId(sessionId);
        Article(url).then(
          (article) => {
            setArticle(article);
            let isProbablyReadable = false;
            let ownIsProbablyReadable = false;
            api.session = sessionId;
            try {
              isProbablyReadable = isProbablyReaderable(
                documentFromTab,
                minLength,
                minScore
              );
              ownIsProbablyReadable = checkReadability(url);
              if (!isProbablyReadable || !ownIsProbablyReadable) {
                setIsReadable(false);
                // if it is not readable, we default the language support to true;
                setLanguageSupported(true);
              } else {
                setIsReadable(true);
                if (api.session !== undefined) {
                  checkLanguageSupportFromUrl(api, url, setLanguageSupported);
                } else {
                  // If we don't have a session assume set the value to false.
                  setLanguageSupported(false);
                }
              }
            } catch {
              setFoundError(true);
            }
          },
          () => {
            setFoundError(true);
            setIsAPIDown(true);
          }
        );
      },
      () => {
        setFoundError(true);
        setIsAPIDown(true);
      }
    );
  }, [url]);

  useEffect(() => {
    if (languageSupported !== undefined && isReadable !== undefined)
      setFoundError(
        sessionId === undefined || !languageSupported || !isReadable
      );
  }, [languageSupported, isReadable]);

  api.session = sessionId;

  if (article === undefined || foundError === undefined) {
    return <ZeeguuLoader />;
  }

  if (foundError || article === null) {
    // We only render the error if both are set.
    return (
      <ZeeguuError
        isNotReadable={!isReadable}
        isNotLanguageSupported={!languageSupported}
        isMissingSession={sessionId === undefined}
        isZeeguuAPIDown={isAPIDown}
        isInternetDown={false}
        api={api}
      />
    );
  }

  let cleanedContent = individualClean(article.content, url, cleanAfterArray);
  cleanedContent = generalClean(cleanedContent);
  cleanedContent = DOMPurify.sanitize(cleanedContent);
  return (
    <Modal
      modalIsOpen={modalIsOpen}
      setModalIsOpen={setModalIsOpen}
      title={article.title}
      author={article.byline}
      content={cleanedContent}
      api={api}
      url={url}
    />
  );
}

const div = document.createElement("div");
const url = window.location.href;
let documentFromTab;
try {
  documentFromTab = getSourceAsDOM(url);
  if (window.location.href.match(drRegex)) {
    const elements = saveElements();
    addElements(elements);
  }
} catch (err) {
  console.error(`failed to execute script: ${err}`);
} finally {
  cleanDOMAfter(url);
  deleteEvents();
  deleteCurrentDOM();
  document.body.appendChild(div);
  ReactDOM.render(<Main documentFromTab={documentFromTab} url={url} />, div);
}
