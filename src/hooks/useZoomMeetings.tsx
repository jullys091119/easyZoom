import { useEffect, useState } from "react";
import { ZoomMtg } from "@zoom/meetingsdk";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

export function useZoomMeeting() {
  const authEndpoint = "http://localhost:4000/signature";

  const meetingNumber = "86765805944";
  const passWord = "5xD7jw";

  const role = 0;

  const userName = "React";
  const userEmail = "";

  const leaveUrl = "http://localhost:5173";

  const [joined, setJoined] = useState(false);

  const [muted, setMuted] = useState(true);

  const [camera, setCamera] = useState(false);

  const [hand, setHand] = useState(false);

  // ---------------------------------------
  // CONTROL DEL PREVIEW ANTES DE ENTRAR
  // ---------------------------------------

  function watchPreview() {
    const observer = new MutationObserver(() => {
      const preview = document.querySelector(
        ".preview-new-flow",
      ) as HTMLElement | null;

      const joinBtn = document.querySelector(
        ".preview-join-button",
      ) as HTMLButtonElement | null;

      const audioBtn = document.querySelector(
        "#preview-audio-control-button",
      ) as HTMLButtonElement | null;

      const videoBtn = document.querySelector(
        "#preview-video-control-button",
      ) as HTMLButtonElement | null;

      if (!preview || !joinBtn || !audioBtn || !videoBtn) {
        return;
      }

      console.log("Preview encontrado");

      observer.disconnect();

      // Esperamos a que Zoom inicialice audio/video

      setTimeout(() => {
        // ---------------------
        // APAGAR AUDIO
        // ---------------------

        const currentAudio = document.querySelector(
          "#preview-audio-control-button",
        ) as HTMLButtonElement | null;

        if (currentAudio) {
          const audioState = currentAudio.getAttribute("aria-label");

          console.log("Audio estado:", audioState);

          if (audioState === "Mute") {
            console.log("apagando audio");

            currentAudio.click();
          }
        }

        // ---------------------
        // APAGAR CAMARA
        // ---------------------

        const currentVideo = document.querySelector(
          "#preview-video-control-button",
        ) as HTMLButtonElement | null;

        if (currentVideo) {
          const videoState = currentVideo.getAttribute("aria-label");

          console.log("Video estado:", videoState);

          if (videoState === "Stop Video") {
            console.log("apagando camara");

            currentVideo.click();
          }
        }

        // ---------------------
        // ESCONDER PREVIEW
        // ---------------------

        setTimeout(() => {
          preview.style.display = "none";

          console.log("Entrando automaticamente");

          joinBtn.click();
        }, 500);
      }, 1000);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function updateAudioState() {
    ZoomMtg.getCurrentUser({
      success: (res: any) => {
        const user = res.result.currentUser;

        setMuted(user.muted);
      },

      error: console.error,
    });
  }

  async function startMeeting() {
    const response = await fetch(authEndpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        meetingNumber,

        role,
      }),
    });

    const data = await response.json();

    initZoom(data.signature);
  }

  function initZoom(signature: string) {
    const root = document.getElementById("zmmtg-root");

    if (root) {
      root.style.display = "block";
    }

    ZoomMtg.init({
      leaveUrl,

      patchJsMedia: true,

      leaveOnPageUnload: true,

      success: () => {
        // IMPORTANTE:
        // antes del join

        watchPreview();

        ZoomMtg.join({
          signature,

          meetingNumber,

          passWord,

          userName,

          userEmail,

          success: () => {
            console.log("Zoom conectado");

            setJoined(true);

            setTimeout(() => {
              updateAudioState();
            }, 1000);

            ZoomMtg.inMeetingServiceListener(
              "onUserAudioStatusChange",

              () => {
                updateAudioState();
              },
            );
          },

          error: console.error,
        });
      },

      error: console.error,
    });
  }

  function toggleMute() {
    ZoomMtg.getCurrentUser({
      success: (res: any) => {
        const user = res.result.currentUser;

        ZoomMtg.mute({
          userId: user.userId,

          mute: !user.muted,

          success: () => {
            setTimeout(() => {
              updateAudioState();
            }, 500);
          },

          error: console.error,
        });
      },
    });
  }

  // ---------------------------------------
  // CAMARA USA BOTON REAL DE ZOOM
  // ---------------------------------------

  function toggleCamera() {
    const button = document.querySelector(
      ".send-video-container__btn",
    ) as HTMLButtonElement | null;

    if (!button) {
      console.log("boton camara no encontrado");

      return;
    }

    button.click();
  }

  function toggleHand() {
    if (hand) {
      ZoomMtg.lowerHand({
        success: () => {
          setHand(false);
        },

        error: console.error,
      });
    } else {
      ZoomMtg.raiseHand({
        success: () => {
          setHand(true);
        },

        error: console.error,
      });
    }
  }

  function leave() {
    ZoomMtg.leaveMeeting({
      success: () => {
        setJoined(false);
      },

      error: console.error,
    });
  }

  // ---------------------------------------
  // ICONO CAMARA
  // ---------------------------------------

  useEffect(() => {
    if (!joined) return;

    const observer = new MutationObserver(() => {
      const button = document.querySelector(".send-video-container__btn");

      if (!button) return;

      const text = button.textContent || "";

      setCamera(!text.includes("Start Video"));
    });

    observer.observe(
      document.body,

      {
        subtree: true,

        childList: true,

        attributes: true,

        characterData: true,
      },
    );

    return () => {
      observer.disconnect();
    };
  }, [joined]);

  return {
    startMeeting,

    joined,

    muted,

    camera,

    hand,

    toggleMute,

    toggleCamera,

    toggleHand,

    leave,
  };
}
