import { useEffect, useState } from "react";
import { ZoomMtg } from "@zoom/meetingsdk";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

interface ZoomConfig {
  user: string;

  number: string;

  pass: string;
}

export function useZoomMeeting({
  user,

  number,

  pass,
}: ZoomConfig) {
  const authEndpoint = "https://easyzoom.onrender.com/signature";

  const meetingNumber = number;

  const passWord = pass;

  const role = 0;

  const userName = user;

  const userEmail = "";

  const leaveUrl = "http://localhost:5173";

  const [joined, setJoined] = useState(false);

  const [muted, setMuted] = useState(true);

  const [camera, setCamera] = useState(false);

  const [hand, setHand] = useState(false);

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

      observer.disconnect();

      setTimeout(() => {
        const currentAudio = document.querySelector(
          "#preview-audio-control-button",
        ) as HTMLButtonElement | null;

        if (currentAudio) {
          const audioState = currentAudio.getAttribute("aria-label");

          if (audioState === "Mute") {
            currentAudio.click();
          }
        }

        const currentVideo = document.querySelector(
          "#preview-video-control-button",
        ) as HTMLButtonElement | null;

        if (currentVideo) {
          const videoState = currentVideo.getAttribute("aria-label");

          if (videoState === "Stop Video") {
            currentVideo.click();
          }
        }

        setTimeout(() => {
          preview.style.display = "none";

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
    try {
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
    } catch (error) {
      console.error("Error obteniendo signature:", error);
    }
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

            (ZoomMtg.inMeetingServiceListener as any)(
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

  useEffect(() => {
    if (!joined) return;

    const observer = new MutationObserver(() => {
      const button = document.querySelector(".send-video-container__btn");

      if (!button) return;

      const text = button.textContent || "";

      setCamera(!text.includes("Start Video"));
    });

    observer.observe(document.body, {
      subtree: true,

      childList: true,

      attributes: true,

      characterData: true,
    });

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
