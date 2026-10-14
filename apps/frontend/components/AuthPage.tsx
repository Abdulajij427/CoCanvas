export function AuthPage({isSignin}:{
    isSignin: boolean
}){

    return(
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-6 m-2 bg-white rounded">
                <div className="p-2">
                    <input type="text" placeholder="Email" className="border rounded px-3 py-2 placeholder:text-gray-700"/>
                </div>
                <div className=" p-2 ">
                    <input type="password" placeholder="password" className="border rounded px-3 py-2 placeholder:text-gray-700"/>
                </div>
                <button className="bg-red-200 border rounded px-3 py-1 cursor-pointer " onClick={()=>{

                }}
                 >{isSignin ? "Sign in" : "Sign up"}</button>
            </div>
        </div>
    )
}


