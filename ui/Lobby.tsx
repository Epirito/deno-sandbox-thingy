export default function Lobby(props: {onReady: (e: Event)=>void}) {
    return <div>
        <button onClick={props.onReady}>Ready</button>
    </div>
}