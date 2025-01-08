// Function to compute similarity
function areTextsRelated(text1, text2) {
        // List of stopwords to exclude from comparison
        const stopwords = new Set(["the", "a", "and", "in", "on", "for", "to", "of", "with", "is", "it", "at", "by"]);

        // Function to filter out stopwords and split text into words
        function getKeywords(text) {
            return text.toLowerCase()
                .split(/\s+/)
                .filter(word => !stopwords.has(word)); // Exclude stopwords
        }
    
        // Get keywords from both texts
        const keywords1 = getKeywords(text1);
        const keywords2 = getKeywords(text2);
    
        // Use Sets to find unique words in both texts
        const set1 = new Set(keywords1);
        const set2 = new Set(keywords2);
    
        // Find the intersection (common words)
        const commonWords = [...set1].filter(word => set2.has(word));
    
        // Return true if more than one similar keyword is found
        return commonWords.length > 1;
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

         tokensComparation = tokensList.map( token => {

            const comparition = areTextsRelated(token.description, text)
            return {
              ...token,
              isRelated: comparition
            }
         })


         if(tokensComparation.length > 0){
          tokensComparation = tokensComparation.filter(token => token.isRelated )
          tokensComparation = tokensComparation.map(token => ({
            ca: token.tokenAddress,
            chain: token.chainId,
            icon: token.icon,
            description: token.description,
            links: [...token.links.filter(link => ['website', 'twitter', 'telegram'].includes(link.type || link.label?.toLowerCase())), {type: "dexscreener", url: `https://dexscreener.com/${token.chainId}/${token.tokenAddress}`}]
          }))
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
  