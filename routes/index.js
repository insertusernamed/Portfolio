var express = require('express');
const axios = require('axios');
var router = express.Router();
const colors = require('../public/colors.json');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Home' });
});

router.get('/cv', function (req, res, next) {
    res.render('cv', { title: 'CV' });
});

router.get('/projects', function (req, res, next) {
    axios.get(`https://api.github.com/users/insertusernamed/repos?sort=updated&direction=desc`)
        .then(async response => {
            let modifiedRepos = [];

            for (const repo of response.data) {
                const languagesResponse = await axios.get(repo.languages_url);
                const languagesData = languagesResponse.data;

                // Get top 3 languages by character count
                const topLanguages = Object.entries(languagesData)
                    .sort((a, b) => b[1] - a[1]) // Sort by number of characters descending
                    .slice(0, 3) // Take top 3 languages
                    .map(([language, charCount]) => {
                        const totalChars = Object.values(languagesData).reduce((acc, curr) => acc + curr, 0);
                        const percent = Math.round((charCount / totalChars) * 100); // Calculate percentage and round to nearest whole number
                        const color = colors[language] || '#000'; // Use black as default color if language is not in colors.json
                        return { language, percent, color };
                    });

                const modifiedRepo = {
                    name: repo.name,
                    description: repo.description,
                    html_url: repo.html_url,
                    topLanguages
                };

                modifiedRepos.push(modifiedRepo);
            }
            res.render('projects', { title: 'Projects', projects: modifiedRepos, colors: colors });
        })
        .catch(error => {
            res.render('projects', { title: 'Projects', projects: error });
            console.error('Error fetching user repositories:', error);
        });
});

module.exports = router;
