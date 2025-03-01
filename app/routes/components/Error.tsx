export default function ErrorComponent() {
    return <div className="w-full h-full p-5 flex flex-col gap-5 items-center justify-center">
        <img src="/notfound.jpg" alt="" className="w-[400px] max-w-full object-cover rounded-xl"/>
        <span className="text-lg">Opps! Something has gone terribly wrong</span>
    </div> 
}