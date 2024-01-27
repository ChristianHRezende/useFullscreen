import React from "react";

interface FullscreenDocument extends Omit<Document, "onfullscreenchange"> {
  mozFullScreenElement: Element | null;
  msFullscreenElement: Element | null;
  webkitFullscreenElement: Element | null;
  fullscreenElement: Element | null;
  mozCancelFullScreen: () => Promise<void>;
  webkitExitFullscreen: () => Promise<void>;
  onfullscreenchange: ((this: Document, ev: Event) => void) | null | undefined;
}

interface DocumentElement extends Element {
  mozRequestFullScreen: () => Promise<void>;
  webkitRequestFullscreen: () => Promise<void>;
}

export default function useFullscreen(): [boolean, () => void] {
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(
    (document as FullscreenDocument)[getBrowserFullscreenElementProp()] !== null
  );

  const setFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen()
        .then(() => {
          setIsFullscreen(
            (document as FullscreenDocument)[
              getBrowserFullscreenElementProp()
            ] === null
          );
        })
        .catch(() => {
          setIsFullscreen(true);
        });
      return;
    }
    enterFullscreen()
      .then(() => {
        setIsFullscreen(
          (document as FullscreenDocument)[
            getBrowserFullscreenElementProp()
          ] !== null
        );
      })
      .catch(() => {
        setIsFullscreen(false);
      });
  };

  React.useLayoutEffect(() => {
    (document as FullscreenDocument).onfullscreenchange = () =>
      setIsFullscreen(
        (document as FullscreenDocument)[getBrowserFullscreenElementProp()] !==
          null
      );

    return () =>
      ((document as FullscreenDocument).onfullscreenchange = undefined);
  });

  return [isFullscreen, setFullscreen];
}

const exitFullscreen = () => {
  if ((document as FullscreenDocument).exitFullscreen) {
    return (document as FullscreenDocument).exitFullscreen();
  } else if ((document as FullscreenDocument).mozCancelFullScreen) {
    return (document as FullscreenDocument).mozCancelFullScreen();
  } else if ((document as FullscreenDocument).webkitExitFullscreen) {
    return (document as FullscreenDocument).webkitExitFullscreen();
  }
  throw new Error("Your browser don't support exitFullscreen");
};

const enterFullscreen = () => {
  const elem = document.documentElement as unknown as DocumentElement;
  if (elem.requestFullscreen) {
    return elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    // Firefox
    return elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    // Chrome, Safari, and Opera
    return elem.webkitRequestFullscreen();
  }
  throw new Error("Your browser don't support enterFullscreen");
};

function getBrowserFullscreenElementProp() {
  if (
    typeof (document as FullscreenDocument).fullscreenElement !== "undefined"
  ) {
    return "fullscreenElement";
  } else if (
    typeof (document as FullscreenDocument).mozFullScreenElement !== "undefined"
  ) {
    return "mozFullScreenElement";
  } else if (
    typeof (document as FullscreenDocument).msFullscreenElement !== "undefined"
  ) {
    return "msFullscreenElement";
  } else if (
    typeof (document as FullscreenDocument).webkitFullscreenElement !==
    "undefined"
  ) {
    return "webkitFullscreenElement";
  } else {
    throw new Error("fullscreenElement is not supported by this browser");
  }
}
