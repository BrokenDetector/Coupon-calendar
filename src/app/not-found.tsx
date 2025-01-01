import Link from "next/link";

const NotFound = () => {
	return (
		<main className="flex flex-col items-center mt-20 text-lg gap-2">
			<div className="text-center flex items-center flex-col mt-20">
				<h1 className="text-9xl font-bold mb-5">
					404
					<br />
					<span className="text-5xl font-bold mb-5">НЕ НАЙДЕНО</span>
				</h1>
				<p className="italic">Запрашиваемый контент не найден.</p>
				<Link
					href="/"
					className="mt-4 underline hover:text-gray-600"
				>
					Вернуться на главную
				</Link>
			</div>
		</main>
	);
};

export default NotFound;
