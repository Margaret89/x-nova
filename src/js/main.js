// Плавный переход к блоку
if($('.js-link-move').length){
	$('.js-link-move').on('click', function() {
		var posBlock = $('.js-to-move[data-move='+$(this).data('move')+']').offset().top;

		$(window).on('resize', function(){
			posBlock = $('.js-to-move[data-move='+$(this).data('move')+']').offset().top;
		});
		
		$('html, body').animate({ scrollTop: posBlock }, 600);
	});
}
