const notFound = () => {
	return (
		<main className="flex flex-col items-center mt-20 text-lg gap-2">
			<div className="text-center flex items-center flex-col mt-20">
				<h1 className="text-9xl font-bold mb-5">
					404
					<br />
					<span className="text-5xl font-bold mb-5">NOT FOUND</span>
				</h1>
				<p className="italic">The requested content has not been found.</p>
			</div>
		</main>
	);
};

export default notFound;