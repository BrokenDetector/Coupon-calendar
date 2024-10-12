export const getCurrencySymbol = (currency: string): string => {
	switch (currency.toUpperCase()) {
		case "RUB":
			return "₽";
		case "EUR":
			return "€";
		case "USD":
			return "$";
		case "CNY":
			return "¥";
		default:
			return "";
	}
};
