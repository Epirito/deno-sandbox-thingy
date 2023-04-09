export default function Lobby(props: {onReady: ()=>void}) {
    return <div>
        <button onClick={props.onReady}>Ready</button>
    </div>
}