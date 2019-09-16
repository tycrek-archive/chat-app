exports.checkRequirements = (pw) => {
	let MIN_LENGTH = 12;
	let LOWER = new RegExp(/([a-z])/g);
	let UPPER = new RegExp(/[A-Z]/g);
	let NUMBER = new RegExp(/[0-9]/g);
	let SYMBOL = new RegExp(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
	let MIN_EACH = 2;

	if (
		pw.length >= MIN_LENGTH &&
		pw.match(LOWER).length >= MIN_EACH &&
		pw.match(UPPER).length >= MIN_EACH &&
		pw.match(NUMBER).length >= MIN_EACH &&
		pw.match(SYMBOL).length >= MIN_EACH
	) return true;
	else return false;
}