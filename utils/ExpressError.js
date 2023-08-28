class ExpressError extends Error {
	constructor(code, message, errToast) {
		super()
		this.code = code
		this.message = message
		this.errToast = errToast
	}
}

module.exports = ExpressError
