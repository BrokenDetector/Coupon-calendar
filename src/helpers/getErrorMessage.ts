export const getErrorMessage = (error: string) => {
	console.log(error);
	if (error.includes("[MOEX ERROR]")) {
		return "Не удалось получить данные с Московской биржи. Попробуйте позже.";
	}
	if (error.includes("Failed to fetch")) {
		return "Проблема с интернет-соединением. Проверьте подключение к интернету.";
	}
	if (error.includes("Unauthorized")) {
		return "Ошибка авторизации. Войдите в систему заново.";
	}
	return "Что-то пошло не так. Попробуйте обновить страницу.";
};
