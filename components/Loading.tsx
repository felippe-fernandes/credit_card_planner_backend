import { Loader2 } from "lucide-react";


const Loading: React.FC = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center" >
            <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        </div >
    )
}

export default Loading;