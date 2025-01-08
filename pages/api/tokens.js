// Function to compute similarity
// function areTextsRelated(text1, text2) {
//         // List of stopwords to exclude from comparison
//         const stopwords = new Set(["the", "a", "and", "in", "on", "for", "to", "of", "with", "is", "it", "at", "by"]);

//         // Function to filter out stopwords and split text into words
//         function getKeywords(text) {
//             return text.toLowerCase()
//                 .split(/\s+/)
//                 .filter(word => !stopwords.has(word)); // Exclude stopwords
//         }
    
//         // Get keywords from both texts
//         const keywords1 = getKeywords(text1);
//         const keywords2 = getKeywords(text2);
    
//         // Use Sets to find unique words in both texts
//         const set1 = new Set(keywords1);
//         const set2 = new Set(keywords2);
    
//         // Find the intersection (common words)
//         const commonWords = [...set1].filter(word => set2.has(word));

//         const relationPercent = commonWords.length / set1.size + set2.size
//         console.log(`Relation Percent ${relationPercent}`)
//         // Return true if more than one similar keyword is found
//         return relationPercent > 0.3;
// }

const tf = require('@tensorflow/tfjs')
const use = require('@tensorflow-models/universal-sentence-encoder');

// Function to compute cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to compare two texts
async function compareTexts(model, textA, textB) {
  const [embeddingA, embeddingB] = await Promise.all([
      model.embed([textA]), // Text must be an array
      model.embed([textB])  // Text must be an array
  ]);

  // Extract the embeddings
  const vecA = (await embeddingA.array())[0];
  const vecB = (await embeddingB.array())[0];

  // Clean up memory
  embeddingA.dispose();
  embeddingB.dispose();

  // Compute cosine similarity
  return cosineSimilarity(vecA, vecB);
}

// Main function to compare multiple texts
async function compareMultipleTexts(baseText, texts) {
  console.log('Loading Universal Sentence Encoder model...');
  const model = await use.load();

  console.log('Comparing texts...');
  const results = await Promise.all(
      texts.map(async (obj) => {
          const similarity = await compareTexts(model, baseText, obj.description);
          return { ...obj, isRelated: similarity > 0.5 };
      })
  );

  console.log('Comparison complete.');
  return results;
}

async function getTokensList() {
    const rawResponse = await fetch("https://api.dexscreener.com/token-profiles/latest/v1")

    if(!rawResponse.ok){
      throw new Error('Could not get tokens list from Dexscreener')
    }

    const tokens = await rawResponse.json()

    const filteredTokens = tokens.filter(token => token.description)

    return filteredTokens
}


export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method === "POST") {
      const { text } = req.body;
  
      // Validate that text is provided
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required and must be a string" });
      }
  
      let tokensList
      let tokensComparation = []
      try{
         tokensList = await getTokensList()

         tokensComparation = await compareMultipleTexts(text, tokensList)
         if(tokensComparation.length > 0){
          tokensComparation = tokensComparation.filter(token => token.isRelated )
          tokensComparation = tokensComparation.map(token => ({
            ca: token.tokenAddress,
            chain: token.chainId,
            icon: token.icon,
            description: token.description,
            links: [...token.links.filter(link => ['website', 'twitter', 'telegram'].includes(link.type || link.label?.toLowerCase())), {type: "dexscreener", url: `https://dexscreener.com/${token.chainId}/${token.tokenAddress}`}]
          }))
          tokensComparation = tokensComparation.map(async token => {
            const { ca } = token
            const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${ca}`)
            const data = await response.json()
          
            if(data.pairs && data.pairs.length > 0){
              token.baseToken = data.pairs[0].baseToken
              token.marketCap = data.pairs[0].marketCap
              token.volume24h = data.pairs[0].volume.h24
              
            }

            return token
          })

          tokensComparation = await Promise.all(tokensComparation)
         }

      }catch(e){
        console.log(e)
        return res.status(500).json({
          error: e.message
        })
      }

      // Respond with a success message
      return res.status(200).json(tokensComparation);
    } else {
      // Method not allowed
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  }
  