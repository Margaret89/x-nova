//noUiSlider
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.min.css';
import wNumb from 'wnumb';

//Particles
import Particles from 'particlesjs';

//Fancybox
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
Fancybox.bind("[data-fancybox]", {
	on: {
		done: (fancybox, slide) => {
			if(document.querySelector('.popup-window')){
				document.querySelector('.popup-window').classList.remove('hide');
			}
		},
		close: (fancybox, slide) => {
			if(document.querySelector('.popup-window')){
				document.querySelector('.popup-window').classList.add('hide');
			}
		}
	}
});

//Choices
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';

//CountUp
import { CountUp } from 'countup.js';

// Валидация форм

//Функция добавления ошибки
const generateError = function (text) {
	var error = document.createElement('div')
	error.className = 'error-msg'
	// error.style.color = 'red'
	error.innerHTML = text
	return error
}

document.querySelectorAll(".js-btn-submit").forEach(function(btn){
	btn.onclick = function(e){
		e.preventDefault();

		var form =  e.target.closest('form');
		var patternEmail = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,6}\.)?[a-z]{2,6}$/i;

		//Очистка ошибок
		form.querySelectorAll('.error').forEach(function(err){
			if(err.querySelector('.error-msg')){
				err.querySelector('.error-msg').remove();
			}
			err.querySelector('input').setAttribute('placeholder', '');
			err.classList.remove('error');
		});
	  
		//Проверка полей на пустоту
		form.querySelectorAll('.js-form-site-item input').forEach(function(field){
			//Проверка email
			// if(field.type == 'email' && field.value !== ''){
			if(field.type == 'email'){
				if (!patternEmail.test(field.value)) {
					var errorMsg =  generateError('Укажите корректный E-mail');
					field.parentElement.classList.add('error');
					// field.parentElement.append(errorMsg);
				}
			}else{
				//Проверка всех полей
				if (field.value === '' &&  field.hasAttribute('required')) {
					var errorMsg = generateError('Заполните поле');
					field.parentElement.classList.add('error');
					// field.parentElement.append(errorMsg);
				}
			}
		});

		//Проверка checkbox на checked
		form.querySelectorAll('.js-form-site-check input').forEach(function(field){
			if(!field.checked && field.hasAttribute('required')){
				var errorMsg = generateError('Заполните поле');
				field.closest('.js-form-site-check').classList.add('error');
				field.parentElement.after(errorMsg);
			}
		});

		// var idRecaptcha = btn.closest('form').querySelector('.g-recaptcha').getAttribute('data-widget');

		// console.log('idRecaptcha = ', idRecaptcha);
		// var response = grecaptcha.getResponse(idRecaptcha);
		// var captcha = btn.closest('form').querySelector('.js-form-site-captcha');

		// if(response.length == 0) {
		// 	var errorMsg = generateError('Пройдите проверку');
		// 	captcha.classList.add('error');
		// 	captcha.append(errorMsg);
		// }

		if(form.querySelectorAll('.error').length === 0){
			form.reset();
			Fancybox.close();
			Fancybox.show([{ src: "#msg-success", type: "inline" }]);
			// let url = form.getAttribute('action');
			// const formData=new FormData(form);
			// formData.append('web_form_submit', 'Отправить');

			// sendForm(url, formData, function(){
			// 	form.reset();
			// });

		}
	};
});

var successTitle = document.querySelector('.js-success-alert-title').innerHTML;
var successText = document.querySelector('.js-success-alert-text').innerHTML;

document.addEventListener('openSuccessPopupForm',function(e){
	let curSuccessTitle = e.target.activeElement.closest('.js-valid-form').getAttribute('data-title');
	let curSsuccessText = e.target.activeElement.closest('.js-valid-form').getAttribute('data-text');

	if(curSuccessTitle){
		document.querySelector('.js-success-alert-title').innerHTML = curSuccessTitle;
	}else{
		document.querySelector('.js-success-alert-title').innerHTML = successTitle;
	}

	if(curSsuccessText){
		document.querySelector('.js-success-alert-text').innerHTML = curSsuccessText;
	}else{
		document.querySelector('.js-success-alert-text').innerHTML = successText;
	}

	Fancybox.close();
	Fancybox.show([{ src: "#msg-success", type: "inline" }]);
});

async function sendForm(url, data, functionSuccess){
	let response = await fetch(url,{
		method: 'POST',
		body: data
	});
	
	if (response.ok){
		let text = await response.text();
		let event = new Event("openSuccessPopupForm");
		document.dispatchEvent(event);
		functionSuccess();
	} else {
		alert("Ошибка HTTP: " + response.status);
	}
}

// Плавный переход к блоку
// if($('.js-link-move').length){
// 	$('.js-link-move').on('click', function() {
// 		var posBlock = $('.js-to-move[data-move='+$(this).data('move')+']').offset().top;

// 		$(window).on('resize', function(){
// 			posBlock = $('.js-to-move[data-move='+$(this).data('move')+']').offset().top;
// 		});
		
// 		$('html, body').animate({ scrollTop: posBlock }, 600);
// 	});
// }

if (document.querySelector('.js-link-move')) {
	// Плавный переход к ссылке
	document.querySelectorAll(".js-link-move").forEach(function(btn){
		btn.onclick = function(event){
			event.preventDefault();
			const id = btn.getAttribute('href');

			if (document.querySelector('#'+id)) {
				document.querySelector('#'+id).scrollIntoView({
					behavior: 'smooth'
				});
			}
		}
	});
}

//Кастомный селект
if(document.querySelector('.js-select')){
	document.querySelectorAll(".js-select").forEach(function(select){
		const choices = new Choices(select, {
			searchEnabled: false,
			removeItemButton: false,
			shouldSort: false,
		});
	});
}

// range slider
if(document.querySelector('.js-slider-range')){
	document.querySelectorAll('.js-slider-range').forEach(function(slider){
		let start = Number(slider.getAttribute('data-cur-min'));
		let minVal = Number(slider.getAttribute('data-min'));
		let maxVal = Number(slider.getAttribute('data-max'));
		let step = Number(slider.getAttribute('data-step'));
		let valElem = slider.closest('.js-range').querySelector('.js-slider-range-val');
		let unit = slider.getAttribute('data-unit');

		noUiSlider.create(slider, {
			start: start,
			connect: 'lower',
			step: step,
			range: {
				'min': minVal,
				'max': maxVal
			},
			pips: {
				mode: 'steps',
				density: step
			},
			format: wNumb({
				decimals: 0,
				thousand: ' ',
				suffix: ' '+unit
			})
		});

		slider.noUiSlider.on('update', function (values, handle) {
			valElem.textContent = values;
		});
	});
}

// Анимация фоновых точек
var particles = Particles.init({
	selector: '.js-bg-animate',
	color: '#ffffff',
	maxParticles: 200,
	sizeVariations: 3,
	speed: 0.7
});

//Анимация блоков при скролле
document.addEventListener('DOMContentLoaded', function() {
	let blocks = document.querySelectorAll('.js-animate');
 
	function checkBlocksVisibility() {
		let windowHeight = window.innerHeight;
 
		blocks.forEach(block => {
			let blockPosition = block.getBoundingClientRect().top;
 
			if (blockPosition < windowHeight - 100) {
				// block.style.opacity = "1";
				// block.style.transform = "translateY(0)";
				block.classList.add('animated');
			}
		});
	}
 
	checkBlocksVisibility();
 
	window.addEventListener('scroll', function() {
		checkBlocksVisibility();
	});
});

//Анимация цифр
if(document.querySelector('.js-countup')){
	document.querySelectorAll('.js-countup').forEach(function(counter){
		let num = counter.getAttribute('data-num');
		let sign = counter.getAttribute('data-sign');

		if(!sign){
			sign = '';
		}

		let countUp = new CountUp(counter, num, {
			enableScrollSpy: true,
			separator: ' ',
			scrollSpyOnce: true,
			prefix: sign
		});
		if (!countUp.error) {
		countUp.start();
		} else {
		console.error(countUp.error);
		}
	});
}