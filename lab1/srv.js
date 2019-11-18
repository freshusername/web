var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var methodOverride = require('method-override');
var log = require('./libs/log')(module);
var config = require('./libs/config');
var ArticleModel = require('./libs/mongoose').ArticleModel;
var app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('tiny'));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));

app.use(methodOverride()); // поддержка put и delete 

app.use(express.static(path.join(__dirname, "public")));

app.get('/api/articles', function (req, res) {
	return ArticleModel.find(function (err, articles) {
		if (!err) {
			return res.send(articles);
		} else {
			res.statusCode = 500;
			log.error('Internal error(' + res.statusCode + '): ' + err.message);
			return res.send({ error: 'Server error' });
		}
	});
});

app.post('/api/articles', function (req, res) {
	var article = new ArticleModel({
		title: req.body.title,
		author: req.body.author,
		description: req.body.description,
	});

	article.save(function (err) {
		if (!err) {
			log.info("article created");
			return res.send({
				status: 'OK',
				article: article
			});
		} else {
			console.log(err);
			if (err.name == 'ValidationError') {
				res.statusCode = 400;
				res.send({ error: 'Validation error' });
			} else {
				res.statusCode = 500;
				res.send({ error: 'Server error' });
			}
			log.error('Internal error(' + res.statusCode + '): ' + err.message);
		}
	});
});

app.get('/api/articles/:id', function (req, res) {
	return ArticleModel.findById(req.params.id, function (err, article) {
		if (!article) {
			res.statusCode = 404;
			return res.send({ error: 'Not found' });
		}
		if (!err) {
			return res.send({ status: 'OK', article: article });
		} else {
			res.statusCode = 500;
			log.error('Internal error(' + res.statusCode + '): ' + err.message);
			return res.send({ error: 'Server error' });
		}
	});
});

app.put('/api/articles/:id', function (req, res) {
	return ArticleModel.findById(req.params.id, function (err, article) {
		if (!article) {
			res.statusCode = 404;
			return res.send({ error: 'Not found' });
		}
		article.title = req.body.title;
		article.description = req.body.description;
		article.author = req.body.author;
		return article.save(function (err) {
			if (!err) {
				log.info("article updated");
				return res.send({ status: 'OK', article: article });
			} else {
				if (err.name == 'ValidationError') {
					res.statusCode = 400;
					res.send({ error: 'Validation error' });
				} else {
					res.statusCode = 500;
					res.send({ error: 'Server error' });
				}
				log.error('Internal error(' + res.statusCode + '): ' + err.message);
			}
		});
	});
});

app.delete('/api/articles/:id', function (req, res) {
	return ArticleModel.findById(req.params.id, function (err, article) {
		if (!article) {
			res.statusCode = 404;
			return res.send({ error: 'Not found' });
		}
		return article.remove(function (err) {
			if (!err) {
				log.info("article removed");
				return res.send({ status: 'OK' });
			} else {
				res.statusCode = 500;
				log.error('Internal error(' + res.statusCode + '): ' + err.message);
				return res.send({ error: 'Server error' });
			}
		});
	});
});

app.get('/ErrorExample', function (req, res, next) {
	next(new Error('Random error!'));
});

app.get('/test', function (req, res) {
	res.send('GET request to the homepage');
});

app.get('/api', function (req, res) {
	res.send('API is running');
});

app.use(function (req, res, next) {
	res.status(404);
	log.debug('Not found URL: ' + req.url);
	res.send({ error: 'Not found' });
	return;
});

app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	log.error('123');
	log.error('Internal error(' + res.statusCode + '): ' + err.message);
	res.send({ error: err.message });
	return;
});

app.listen(config.get('port'), function () {
	log.info('Express server listening on port ' + config.get('port'));
}); 