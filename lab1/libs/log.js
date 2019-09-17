var winston = require('winston');

function getLogger(module) {
	var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение
		
	return winston.createLogger({
		transports: [
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.label({ label: path }),
					winston.format.colorize(),
					winston.format.simple()
				),
				level: 'debug',
			}),
		]
	});
}

module.exports = getLogger;
