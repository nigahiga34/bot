const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;

const features = {
  '.weather': async (location) => {
    try {
      const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`);
      const { main, weather } = response.data;
      return `Weather in ${location}: ${weather[0].description}, Temperature: ${main.temp}°C`;
    } catch (error) {
      return "Couldn't fetch weather data. Please try again.";
    }
  },

  '.news': async (category = 'general') => {
    try {
      const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`);
      const articles = response.data.articles.slice(0, 3);
      return articles.map(article => `${article.title}\n${article.url}`).join('\n\n');
    } catch (error) {
      return "Couldn't fetch news. Please try again.";
    }
  },

  '.calories': async (food) => {
    try {
      const response = await axios.post('https://trackapi.nutritionix.com/v2/natural/nutrients', 
        { query: food },
        { 
          headers: {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_API_KEY,
          }
        }
      );
      const { foods } = response.data;
      return `Calories in ${food}: ${foods[0].nf_calories}`;
    } catch (error) {
      return "Couldn't fetch calorie information. Please try again.";
    }
  },

  '.joke': async () => {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      const { setup, punchline } = response.data;
      return `${setup}\n${punchline}`;
    } catch (error) {
      return "Couldn't fetch a joke. Please try again.";
    }
  },

  '.quote': async () => {
    try {
      const response = await axios.get('https://api.quotable.io/random');
      const { content, author } = response.data;
      return `"${content}" - ${author}`;
    } catch (error) {
      return "Couldn't fetch a quote. Please try again.";
    }
  },

  '.trivia': async () => {
    try {
      const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
      const { question, correct_answer, incorrect_answers } = response.data.results[0];
      return `Question: ${question}\nAnswer: ${correct_answer}`;
    } catch (error) {
      return "Couldn't fetch trivia. Please try again.";
    }
  },

  '.currency': async (amount, from, to) => {
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
      const rate = response.data.rates[to];
      return `${amount} ${from} = ${(amount * rate).toFixed(2)} ${to}`;
    } catch (error) {
      return "Couldn't perform currency conversion. Please try again.";
    }
  },

  '.dict': async (word) => {
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const { meanings } = response.data[0];
      return `Definition of ${word}: ${meanings[0].definitions[0].definition}`;
    } catch (error) {
      return "Couldn't find the definition. Please try again.";
    }
  },

  '.advice': async () => {
    try {
      const response = await axios.get('https://api.adviceslip.com/advice');
      return response.data.slip.advice;
    } catch (error) {
      return "Couldn't fetch advice. Please try again.";
    }
  },

  '.recipe': async (ingredient) => {
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
      const meal = response.data.meals[0];
      return `Recipe suggestion with ${ingredient}: ${meal.strMeal}`;
    } catch (error) {
      return "Couldn't find a recipe. Please try again.";
    }
  },

  '.help': () => {
    return `Available commands:
    .weather [location] - Get weather information
    .news [category] - Get top news (categories: business, entertainment, general, health, science, sports, technology)
    .calories [food] - Get calorie information for a food item
    .joke - Get a random joke
    .quote - Get a random quote
    .trivia - Get a trivia question
    .currency [amount] [from] [to] - Convert currency
    .dict [word] - Get the definition of a word
    .advice - Get random advice
    .recipe [ingredient] - Get a recipe suggestion`;
  }
};

app.post('/webhook', async (req, res) => {
  const { message, sender } = req.body;
  
  const [command, ...args] = message.split(' ');
  
  if (features[command]) {
    try {
      const response = await features[command](...args);
      await sendMessage(sender, response);
    } catch (error) {
      await sendMessage(sender, "An error occurred. Please try again.");
    }
  } else {
    await sendMessage(sender, "Command not recognized. Type .help for a list of commands.");
  }

  res.sendStatus(200);
});

async function sendMessage(recipient, message) {
  // Implement your messaging platform's API call here
  console.log(`Sending to ${recipient}: ${message}`);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// ... (previous code remains the same)

const TRANSLATE_API_KEY = process.env.TRANSLATE_API_KEY;
const COVID_API_URL = 'https://disease.sh/v3/covid-19/countries';
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

// Add these to the existing features object
const newFeatures = {
  '.translate': async (text, targetLang) => {
    try {
      const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`, {
        q: text,
        target: targetLang
      });
      return `Translation: ${response.data.data.translations[0].translatedText}`;
    } catch (error) {
      return "Couldn't perform translation. Please try again.";
    }
  },

  '.covid': async (country) => {
    try {
      const response = await axios.get(`${COVID_API_URL}/${country}`);
      const { cases, deaths, recovered } = response.data;
      return `COVID-19 stats for ${country}: Cases: ${cases}, Deaths: ${deaths}, Recovered: ${recovered}`;
    } catch (error) {
      return "Couldn't fetch COVID-19 data. Please try again.";
    }
  },

  '.movie': async (title) => {
    try {
      const response = await axios.get(`http://www.omdbapi.com/?t=${title}&apikey=${MOVIE_API_KEY}`);
      const { Title, Year, Director, Plot } = response.data;
      return `${Title} (${Year})\nDirected by: ${Director}\nPlot: ${Plot}`;
    } catch (error) {
      return "Couldn't fetch movie information. Please try again.";
    }
  },

  '.nasa': async () => {
    try {
      const response = await axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
      return `NASA Astronomy Picture of the Day:\nTitle: ${response.data.title}\nExplanation: ${response.data.explanation}\nImage: ${response.data.url}`;
    } catch (error) {
      return "Couldn't fetch NASA picture of the day. Please try again.";
    }
  },

  '.crypto': async (coin) => {
    try {
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`);
      return `Current price of ${coin}: $${response.data[coin].usd}`;
    } catch (error) {
      return "Couldn't fetch cryptocurrency price. Please try again.";
    }
  },

  // ... (implement other functions similarly)
};

// Merge new features with existing ones
Object.assign(features, newFeatures);

// Update the .help function to include new commands
features['.help'] = () => {
  return `Available commands:\n${Object.keys(features).join('\n')}`;
};

// ... (rest of the code remains the same)