import { 
  AlertTriangle
} from 'lucide-react';
const ErrorGetData = ({error}) => {
  return (
   <div className="text-center py-8 flex flex-col justify-center h-[85vh]">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
 </div>
  )
}

export default ErrorGetData
