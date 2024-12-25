import { Loader } from "lucide-react";

const LoadingSpinner = () => {
	return (
		<div className="flex justify-center items-center h-screen">
			<Loader
				size={40}
				className="size-10 animate-spin"
			/>
		</div>
	);
};

export default LoadingSpinner;
