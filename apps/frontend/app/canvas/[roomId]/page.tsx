
import {Canvas} from '@/components/canvas'
import {Suspense} from 'react' 


async function CanvasContent({
    params,
}:{
    params: Promise<{roomId : string}>;
}){
    const {roomId} = await params;
    console.log(roomId);

    return <div>Canvas for room {roomId}</div>
}


export default async  function CanvasPage({
    params,
    }:{
    params:Promise< {
        roomId: string
    }>

}){

    return (
        <Suspense fallback = {<div>Loading canvas...</div>}>
            <CanvasContent params={params}/>
        </Suspense>
    )
}


