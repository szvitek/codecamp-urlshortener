const express = require('express');
const router = express.Router();
const dns = require('dns');
const urls = require('../models/url');
const dnsPromises = dns.promises;

router.get('/:shorturl', async (req, res) => {
  const shortUrl = req.params.shorturl;
  const url = await urls.findOne({ short_url: +shortUrl });

  if (!url) {
    return res.json({
      error: 'No short URL found for the given input',
    });
  }

  res.redirect(url.original_url);
});

router.get('/', async (req, res) => {
  const limit = req.query.limit || 50;
  const page = req.query.page || 1;
  const u = await urls
    .find({}, '-_id -__v')
    .skip(limit * (page - 1))
    .limit(limit);

  return res.json(u);
});

router.post('/', async (req, res) => {
  try {
    const rawUrl = req.body.url;
    const url = new URL(rawUrl);

    await dnsPromises.lookup(url.hostname);

    const existingUrl = await urls.findOne({
      original_url: url.href,
    });

    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url,
      });
    }

    const newUrl = await urls.create({ original_url: url.href });

    return res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url,
    });
  } catch (e) {
    console.log(e);
    // url validation or dns lookup fails
    if (e.code === 'ERR_INVALID_URL' || 'ENOTFOUND') {
      return res.json({
        error: 'invalid url',
      });
    }

    // generic error
    return res.json({
      error: e?.message || 'error',
    });
  }
});

module.exports = router;
