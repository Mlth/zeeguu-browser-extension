/*global chrome*/
import {useState, useEffect} from "react";
import {MarginTop, StyledModal, StyledCloseButton, StyledHeading, GlobalStyle, StyledButtonOrange, StyledButtonWhite} from "./Modal.styles";
import ZeeguuLoader from "../ZeeguuLoader";
import { EXTENSION_SOURCE} from "../constants";
import {onScroll, onBlur, onFocus} from "../../zeeguu-react/src/reader/ArticleReader";
import InteractiveText from "../../zeeguu-react/src/reader/InteractiveText";
import { getImage } from "../Cleaning/generelClean";
import { interactiveTextsWithTags } from "./interactivityFunctions";
import { getNativeLanguage } from "../../popup/functions";
import {ReadArticle} from "./ReadArticle"
import WordsForArticleModal from "./WordsForArticleModal";
import Exercises from "../../zeeguu-react/src/exercises/Exercises";
import ToolbarButtons from "./ToolbarButtons";
import { CenteredContent } from "../../zeeguu-react/src/components/ColumnWidth.sc";
import strings from "../../zeeguu-react/src/i18n/definitions";

export function Modal({
  title,
  content,
  modalIsOpen,
  setModalIsOpen,
  api,
  url,
  author,
}) {
  const [readArticleOpen, setReadArticleOpen] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);

  const [translating, setTranslating] = useState(true);
  const [pronouncing, setPronouncing] = useState(false);

  const [articleId, setArticleId] = useState();
  const [interactiveTextArray, setInteractiveTextArray] = useState();
  const [interactiveTitle, setInteractiveTitle] = useState();
  const [articleImage, setArticleImage] = useState();
  const [nativeLang, setNativeLang] = useState();
  const [DBArticleInfo, setDBArticleInfo] = useState();
  const [articleLanguage, setArticleLanguage] = useState();

  useEffect(() => {
    if (content !== undefined) {
      let info = {
        url: url,
        htmlContent: content,
        title: title,
        authors: author,
      };
      api.findOrCreateArticle(info, (result_dict) =>
        setDBArticleInfo(JSON.parse(result_dict))
      );
    }
    getNativeLanguage().then((result) => setNativeLang(result));
  }, []);

  useEffect(() => {
    if (DBArticleInfo !== undefined) {
      setArticleId(DBArticleInfo.id);
      setArticleLanguage(DBArticleInfo.language);
      console.log(DBArticleInfo.language);
    }
  }, [DBArticleInfo]);

  useEffect(() => {
    if (articleId !== undefined) {
      let articleInfo = {
        url: url,
        content: content,
        id: articleId,
        title: title,
        language: articleLanguage,
        starred: false,
      };

      let image = getImage(content);
      setArticleImage(image);
      let arrInteractive = interactiveTextsWithTags(content, articleInfo, api);
      setInteractiveTextArray(arrInteractive);
      let itTitle = new InteractiveText(
        title,
        articleInfo,
        api,
        EXTENSION_SOURCE
      );
      setInteractiveTitle(itTitle);
      api.logReaderActivity(api.OPEN_ARTICLE, articleId, "", EXTENSION_SOURCE);

      window.addEventListener("focus", function () {
        onFocus(api, articleId, EXTENSION_SOURCE);
      });
      window.addEventListener("blur", function () {
        onBlur(api, articleId, EXTENSION_SOURCE);
      });

      let getModalClass = document.getElementsByClassName("Modal");
      if (getModalClass !== undefined && getModalClass !== null) {
        setTimeout(() => {
          if (getModalClass.item(0) != undefined) {
            getModalClass.item(0).addEventListener("scroll", function () {
              onScroll(api, articleId, EXTENSION_SOURCE);
            });
          }
        }, 0);
      }
    }
  }, [articleId]);

  localStorage.setItem("native_language", nativeLang);

  function handleClose() {
    setModalIsOpen(false);
    window.removeEventListener("focus", function () {
      onFocus(api, articleId, EXTENSION_SOURCE);
    });
    window.removeEventListener("blur", function () {
      onBlur(api, articleId, EXTENSION_SOURCE);
    });
    document.getElementById("scrollHolder") !== null &&
      document
        .getElementById("scrollHolder")
        .removeEventListener("scroll", function () {
          onScroll(api, articleId, EXTENSION_SOURCE);
        });
    location.reload();
  }

  if (!modalIsOpen) {
    location.reload();
  }

  function openReview(){
    setReviewOpen(true)
    setReadArticleOpen(false)
    setExerciseOpen(false)
  }

  function openExercises(){
    setExerciseOpen(true)
    setReviewOpen(false)
    api.logReaderActivity(api.TO_EXERCISES_AFTER_REVIEW, articleId, "", EXTENSION_SOURCE)
  }

  function reloadExercises(){
    alert("go back")
    setExerciseOpen(false)
    setExerciseOpen(true)
  }

  function openArticle() {
    setReadArticleOpen(true);
    setExerciseOpen(false);
    setReviewOpen(false);
  }

  if (interactiveTextArray === undefined) {
    return <ZeeguuLoader />;
  }

  return (
    <div>
      <GlobalStyle />
      <StyledModal isOpen={modalIsOpen} className="Modal" id="scrollHolder">
        <StyledHeading>
        <img
           src={chrome.runtime.getURL("images/zeeguuLogo.svg")}
           alt={"Zeeguu logo"}
           className="logoModal"
         />
          <StyledCloseButton role="button" onClick={handleClose} id="qtClose">
            X
          </StyledCloseButton>
          {readArticleOpen ? 
          <ToolbarButtons
            translating={translating}
            pronouncing={pronouncing}
            setTranslating={setTranslating}
            setPronouncing={setPronouncing}
          /> : null
          }
        </StyledHeading>
        {readArticleOpen === true && (
          <ReadArticle
            articleId={articleId}
            api={api}
            author={author}
            interactiveTextArray={interactiveTextArray}
            interactiveTitle={interactiveTitle}
            articleImage={articleImage}
            openReview={openReview}
            translating={translating}
            pronouncing={pronouncing}
          />
        )}
        {reviewOpen === true && (
            <WordsForArticleModal
              api={api}
              articleID={articleId}
              openExercises={openExercises}
              openArticle={openArticle}
            />
        )}
        {exerciseOpen === true && (
          <>
            <Exercises
              api={api}
              articleID={articleId}
              source={EXTENSION_SOURCE}
              backToReadingAction={openArticle}
              keepExercisingAction={reloadExercises}
            />
            <MarginTop>
            <CenteredContent>
            <StyledButtonWhite onClick={openArticle}>{strings.backToArticle}</StyledButtonWhite>
            </CenteredContent>
            </MarginTop>
          </>
        )}
      </StyledModal>
    </div>
  );
}
