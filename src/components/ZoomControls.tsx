interface Props {
  muted: boolean;
  camera: boolean;
  hand: boolean;

  onMute: () => void;
  onCamera: () => void;
  onHand: () => void;
  onLeave: () => void;
}


export default function ZoomControls({
  muted,
  camera,
  hand,
  onMute,
  onCamera,
  onHand,
  onLeave
}: Props) {


  return (

    <div className="zoom-controls">


      <div className="zoom-control-item">

        <button onClick={onMute} className="zoom-control-button">
          {muted ? "🔇" : "🔊"}
        </button>

        <span>
          {muted ? "Escuchar" : "Silenciar"}
        </span>

      </div>



      <div className="zoom-control-item">

        <button onClick={onCamera} className="zoom-control-button">
          {camera ? "📷" : "🚫"}
        </button>

        <span>
          {camera ? "Apagar cámara" : "Encender cámara"}
        </span>

      </div>



      <div className="zoom-control-item">

        <button onClick={onHand} className="zoom-control-button">
          {hand ? "👇" : "🤚"}
        </button>

        <span>
          {hand ? "Bajar mano" : "Comentar"}
        </span>

      </div>



      <div className="zoom-control-item">

        <button onClick={onLeave} className="zoom-control-button">
          👋
        </button>

        <span>
          Salir
        </span>

      </div>


    </div>

  );
}