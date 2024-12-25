export const getCurrencySymbol = (currency: string): string => {
	switch (currency.toUpperCase()) {
		case "RUB":
			return "₽";
		case "SUR":
			return "₽";
		case "EUR":
			return "€";
		case "USD":
			return "$";
		case "CNY":
			return "¥";
		case "KGS":
			return "KGS";
		case "CHF":
			return "CHF";
		case "AED":
			return "AED";
		default:
			return "";
	}
};
