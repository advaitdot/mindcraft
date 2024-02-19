import {GoogleGenerativeAI} from "@google/generative-ai";

process.env.GOOGLE_CLOUD_API_KEY = "";


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_CLOUD_API_KEY);

const geminiConfig = {
    apiKey: process.env.GOOGLE_CLOUD_API_KEY,
    //endpoint: process.env.GOOGLE_CLOUD_ENDPOINT, // Optional, for custom endpoints
};

const model = genAI.getGenerativeModel({ model: "gemini-pro", ...geminiConfig });

const embeddingModel = genAI.getGenerativeModel({
    model: "embedding-001",
    ...geminiConfig,
});

export async function sendRequest(turns, systemMessage, stop_seq = '***') {
    const messages = [{ role: 'system', content: systemMessage }].concat(turns);

    try {
        console.log('Awaiting Gemini API response...');
        // const response = await model.generateContent({
        //     prompt: messages.map((m) => m.content).join('\n'),
        //     stop: stop_seq,
        // });
        const result = await model.generateContent(systemMessage);
        const response = await result.response;
        console.log('Received.');
        return response.text();
    } catch (err) {
        console.error(err);
        if (err.code === 'max_tokens_exceeded') {
            return sendRequest(turns.slice(1), systemMessage, stop_seq);
        } else {
            return 'My brain disconnected, try again.';
        }
    }
}

export async function embed(text) {
    try {
        const result = await embeddingModel.embedContent(text);
        const embedding = result.embedding;
        return embedding.values[0];
    } catch (err) {
        console.error(err);
        return null; // Consider a more sophisticated error handling strategy
    }
}


export function cosineSimilarity(a, b) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];  // calculate dot product
        magnitudeA += Math.pow(a[i], 2);  // calculate magnitude of a
        magnitudeB += Math.pow(b[i], 2);  // calculate magnitude of b
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    return dotProduct / (magnitudeA * magnitudeB);  // calculate cosine similarity
}


// import OpenAIApi from 'openai';


// let openAiConfig = null;
// if (process.env.OPENAI_ORG_ID) {
//     openAiConfig = {
//         organization: process.env.OPENAI_ORG_ID,
//         apiKey: process.env.OPENAI_API_KEY,
//     };
// } 
// else if (process.env.OPENAI_API_KEY) {
//     openAiConfig = {
//         apiKey: process.env.OPENAI_API_KEY,
//     };
// }
// else {
//     console.error('OpenAI API key missing! Make sure you set OPENAI_API_KEY and OPENAI_ORG_ID (optional) environment variables.');
//     process.exit(1);
// }

// const openai = new OpenAIApi(openAiConfig);


// export async function sendRequest(turns, systemMessage, stop_seq='***') {

//     let messages = [{'role': 'system', 'content': systemMessage}].concat(turns);

//     let res = null;
//     try {
//         console.log('Awaiting openai api response...')
//         let completion = await openai.chat.completions.create({
//             model: 'gpt-3.5-turbo',
//             messages: messages,
//             stop: stop_seq,
//         });
//         if (completion.choices[0].finish_reason == 'length')
//             throw new Error('Context length exceeded'); 
//         console.log('Received.')
//         res = completion.choices[0].message.content;
//     }
//     catch (err) {
//         if ((err.message == 'Context length exceeded' || err.code == 'context_length_exceeded') && turns.length > 1) {
//             console.log('Context length exceeded, trying again with shorter context.');
//             return await sendRequest(turns.slice(1), systemMessage, stop_seq);
//         } else {
//             console.log(err);
//             res = 'My brain disconnected, try again.';
//         }
//     }
//     return res;
// }


// export async function embed(text) {
//     const embedding = await openai.embeddings.create({
//         model: "text-embedding-ada-002",
//         input: text,
//         encoding_format: "float",
//     });
//     return embedding.data[0].embedding;
// }

// export function cosineSimilarity(a, b) {
//     let dotProduct = 0;
//     let magnitudeA = 0;
//     let magnitudeB = 0;
//     for (let i = 0; i < a.length; i++) {
//         dotProduct += a[i] * b[i];  // calculate dot product
//         magnitudeA += Math.pow(a[i], 2);  // calculate magnitude of a
//         magnitudeB += Math.pow(b[i], 2);  // calculate magnitude of b
//     }
//     magnitudeA = Math.sqrt(magnitudeA);
//     magnitudeB = Math.sqrt(magnitudeB);
//     return dotProduct / (magnitudeA * magnitudeB);  // calculate cosine similarity
// }