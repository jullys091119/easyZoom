import { useState } from "react";
import { ZoomMtg } from "@zoom/meetingsdk";

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();

interface ZoomOptions {
  userName: string;
  userEmail?: string;
  meetingNumber: string;
  passWord: string;
}

export function useZoomMeeting(options: ZoomOptions) {
  const authEndpoint = "https://easyzoom.onrender.com/signature";

  const { userName, userEmail = "", meetingNumber, passWord } = options;

  const role = 0;

  const leaveUrl = window.location.origin;

  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(true);
  const [camera] = useState(false);
  const [hand, setHand] = useState(false);

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
      console.error("signature error", error);
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
        ZoomMtg.join({
          signature,

          meetingNumber,

          passWord,

          userName,

          userEmail,

          success: () => {
            console.log("Usuario conectado:", userName);

            setJoined(true);

            (ZoomMtg.inMeetingServiceListener as any)(
              "onUserAudioStatusChange",
              () => {
                updateAudio();
              },
            );
          },

          error: console.error,
        });
      },

      error: console.error,
    });
  }

  function updateAudio() {
    ZoomMtg.getCurrentUser({
      success: (res: any) => {
        setMuted(res.result.currentUser.muted);
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
            setTimeout(updateAudio, 500);
          },

          error: console.error,
        });
      },
    });
  }

  function toggleHand() {
    if (hand) {
      ZoomMtg.lowerHand({
        success() {
          setHand(false);
        },

        error: console.error,
      });
    } else {
      ZoomMtg.raiseHand({
        success() {
          setHand(true);
        },

        error: console.error,
      });
    }
  }

  function toggleCamera() {
    const button = document.querySelector(
      ".send-video-container__btn",
    ) as HTMLButtonElement;

    if (button) {
      button.click();
    }
  }

  function leave() {
    ZoomMtg.leaveMeeting({
      success() {
        setJoined(false);
      },

      error: console.error,
    });
  }

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
