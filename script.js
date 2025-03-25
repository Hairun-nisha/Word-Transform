// Helper function to fetch data from APIs
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}

// Wikipedia Summary Fetcher with Image and Restrictions
async function getSummary() {
    const topic = document.getElementById("userInput").value.trim();
    const summaryEl = document.getElementById("summary");
    const pictureEl = document.getElementById("picture");

    if (!topic) {
        summaryEl.innerText = "Please enter a topic to summarize.";
        return;
    }

    summaryEl.innerText = "Loading summary...";
    pictureEl.style.display = "none";

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${topic}`;
    const data = await fetchData(url);

    if (data && data.extract) {
        const lines = data.extract.split('. ').slice(0, 15).join('. ') + '.';
        const points = lines.split('. ').slice(0, 7);
        summaryEl.innerHTML = points.map(point => `• ${point.trim()}`).join('<br>');

        if (data.thumbnail && data.thumbnail.source) {
            pictureEl.src = data.thumbnail.source;
            pictureEl.style.display = "block";
        } else {
            pictureEl.style.display = "none";
        }
    } else {
        summaryEl.innerText = "No summary found or an error occurred.";
    }
}

// Synonyms Finder
async function getSynonyms() {
    const word = document.getElementById("userInput").value.trim();
    const synonymsEl = document.getElementById("synonyms");

    if (!word) {
        synonymsEl.innerText = "Please enter a word to find synonyms.";
        return;
    }

    synonymsEl.innerText = "Loading synonyms...";
    const url = `https://api.datamuse.com/words?rel_syn=${word}`;
    const data = await fetchData(url);

    if (data && data.length > 0) {
        synonymsEl.innerText = data.map(item => item.word).join(", ");
    } else {
        synonymsEl.innerText = "No synonyms found or an error occurred.";
    }
}

// Language Translation with 20+ languages and 500-character handling
async function translateText() {
    const text = document.getElementById("summary").innerText;
    const language = document.getElementById("languageSelector").value;
    const translationEl = document.getElementById("translation");

    if (!text || text === "Loading summary..." || language === "none") {
        translationEl.innerText = "Please summarize a topic first.";
        return;
    }

    translationEl.innerText = "Translating...";
    const chunks = text.match(/.{1,500}/g);
    let translatedText = "";

    for (const chunk of chunks) {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${language}`;
        const data = await fetchData(url);

        if (data && data.responseData) {
            translatedText += data.responseData.translatedText + " ";
        } else {
            translatedText += "[Error translating this part.] ";
        }
    }

    translationEl.innerText = translatedText.trim();
}

// Text-to-Speech Functionality with Toggle
let isSpeaking = false;

function toggleSpeakText(text) {
    if ('speechSynthesis' in window) {
        if (isSpeaking) {
            speechSynthesis.cancel();
            isSpeaking = false;
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            speechSynthesis.speak(utterance);
            isSpeaking = true;
            utterance.onend = () => isSpeaking = false;
        }
    } else {
        alert("Sorry, your browser does not support text-to-speech functionality.");
    }
}

// Populate Language Selector Dropdown with 20+ Languages
const languages = [
    { code: "ta", name: "Tamil" },
    { code: "ml", name: "Malayalam" },
    { code: "te", name: "Telugu" },
    { code: "kn", name: "Kannada" },
    { code: "hi", name: "Hindi" },
    { code: "ar", name: "Arabic" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "pt", name: "Portuguese" },
    { code: "it", name: "Italian" },
    { code: "ru", name: "Russian" },
    { code: "tr", name: "Turkish" },
    { code: "th", name: "Thai" },
    { code: "nl", name: "Dutch" },
    { code: "sv", name: "Swedish" },
    { code: "vi", name: "Vietnamese" },
    { code: "pl", name: "Polish" },
    { code: "uk", name: "Ukrainian" },
    { code: "id", name: "Indonesian" },
    { code: "ro", name: "Romanian" }
];
const languageSelector = document.getElementById("languageSelector");
languages.forEach(lang => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.textContent = lang.name;
    languageSelector.appendChild(option);
});

// Attach Event Listeners
document.getElementById("summarizeBtn").addEventListener("click", getSummary);
document.getElementById("summarizeVoiceBtn").addEventListener("click", () => {
    const summary = document.getElementById("summary").innerText;
    toggleSpeakText(summary);
});
document.getElementById("synonymsBtn").addEventListener("click", getSynonyms);
document.getElementById("synonymsVoiceBtn").addEventListener("click", () => {
    const synonyms = document.getElementById("synonyms").innerText;
    toggleSpeakText(synonyms);
});
document.getElementById("translateBtn").addEventListener("click", translateText);
