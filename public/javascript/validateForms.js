// Example starter JavaScript for disabling form submissions if there are invalid fields
;(function () {
	'use strict'

	bsCustomFileInput.init()

	// Fetch all the forms we want to apply custom Bootstrap validation styles to
	var forms = document.querySelectorAll('.validation-form')

	// Loop over them and prevent submission
	Array.prototype.slice.call(forms).forEach(function (form) {
		form.addEventListener(
			'submit',
			function (event) {
				if (!form.checkValidity()) {
					event.preventDefault()
					event.stopPropagation()
				}

				form.classList.add('was-validated')
			},
			false
		)
	})

	const ratingForm = document.getElementById('rating-form')
	if (ratingForm) {
		const invalidFeedback = ratingForm.querySelector('.invalid-feedback')
		ratingForm.addEventListener('submit', (e) => {
			const ratingValue = Array.from(e.target).find(
				(input) => input.name === 'rating' && input.checked
			).value

			if (ratingValue === '0') {
				e.preventDefault()
				invalidFeedback.classList.add('d-block')
			} else {
				invalidFeedback.classList.remove('d-block')
			}
		})

		ratingForm.querySelectorAll('[name="rating"]').forEach((item) => {
			item.addEventListener('change', (e) => {
				invalidFeedback.classList.remove('d-block')
			})
		})
	}
})()
