import config from '../config/index.json';
import isMobile from '../libs/isMobile';
import styleSheetToObj from '../libs/styleSheetToObj';
import getDelay from '../libs/getDelay';

const concatTr = (tr = '0s', delay = '0s') => `${tr} ${delay}`;

function fieldCorrection(options) {
	if (typeof options === 'string' && options[0] === '.') options = styleSheetToObj(options);
	if (options instanceof Object && options.transitionDelay) {
		options.transition = concatTr(options.transition, options.transitionDelay);
		delete options.transitionDelay;
	}
	if (options.transition) options.trms = getDelay(options.transition);

	return options;
}

function validateFields(options, conf) {
	for (const key in options) {
		if (options[key] instanceof Object && !/hints|hintStyle|shape|usual|hover|active|next|prev|wrapper/.test(key)) validateFields(options[key], conf[key]);
		else if (options[key] instanceof Array && key !== 'hints') options[key].forEach((el, i) => { conf[key][i] = fieldCorrection(el); });
		else conf[key] = fieldCorrection(options[key]);
	}
}

function setRev(options) {
	const frames = JSON.parse(JSON.stringify(options));
	const animLength = options.length;
	let index = 0;

	frames.reverse().map((el, i) => {
		index = i === 0 ? i : animLength - i;
		el.transition = options[index].transition;
		el.trms = options[index].trms;
		if (options[index].webkitTransition) el.webkitTransition = options[index].webkitTransition;

		return el;
	});

	return frames;
}

const setDelaySlide = (arr, delay) => { arr.splice(1, 0, { transition: `0s ${delay}ms`, trms: delay }); };

export default (options, box) => {
	try {
		validateFields(options, config);
		config.slideAnimationRev = {
			active: setRev(config.slideAnimation.next),
			next: setRev(config.slideAnimation.active),
		};
		if (config.delayBetweenSlides !== 0) {
			setDelaySlide(config.slideAnimation.next, config.delayBetweenSlides);
			setDelaySlide(config.slideAnimationRev.next, config.delayBetweenSlides);
		}
		config.isMobile = isMobile();
		config.lastSI = box.children.length - 1;
		config.animDuration = Math.max(getDelay(config.slideAnimation.active), getDelay(config.slideAnimation.next));
	} catch (err) {
		console.warn('Error during validation options.');
		console.error(err);
	}

	return config;
};
