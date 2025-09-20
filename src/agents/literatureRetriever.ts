import type { LiteratureRetrieverInput, LiteratureRetrieverOutput } from "./types";

const PUBMED_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const PUBMED_FETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";

function getPubmedApiKey() {
  return process.env.PUBMED_API_KEY || "";
}

function parsePubmedXml(xml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const articles: Array<{ title: string; abstract: string; url?: string; source: string }> = [];
  const articleNodes = doc.getElementsByTagName("PubmedArticle");
  for (let i = 0; i < articleNodes.length; i++) {
    const article = articleNodes[i];
    const titleNode = article.getElementsByTagName("ArticleTitle")[0];
    const abstractNode = article.getElementsByTagName("AbstractText")[0];
    const pmidNode = article.getElementsByTagName("PMID")[0];
    const title = titleNode ? titleNode.textContent || "" : "";
    const abstract = abstractNode ? abstractNode.textContent || "" : "";
    const pmid = pmidNode ? pmidNode.textContent || "" : "";
    articles.push({
      title,
      abstract,
      url: pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined,
      source: "PubMed"
    });
  }
  return articles;
}

// Literature Retriever Agent: PubMed/Europe PMC API integration
export async function fetchLatestResearch(input: LiteratureRetrieverInput): Promise<LiteratureRetrieverOutput> {
  const { query } = input;
  const apiKey = getPubmedApiKey();
  const apiKeyParam = apiKey ? `&api_key=${apiKey}` : "";
  try {
    // Step 1: Search PubMed for article IDs
    const searchUrl = `${PUBMED_SEARCH_URL}?db=pubmed&retmode=json&retmax=5&term=${encodeURIComponent(query)}${apiKeyParam}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error("PubMed search failed");
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult.idlist;
    if (!ids.length) return { articles: [] };

    // Step 2: Fetch article details (XML)
    const fetchUrl = `${PUBMED_FETCH_URL}?db=pubmed&retmode=xml&id=${ids.join(",")}${apiKeyParam}`;
    const fetchRes = await fetch(fetchUrl);
    if (!fetchRes.ok) throw new Error("PubMed fetch failed");
    const xml = await fetchRes.text();
    const articles = parsePubmedXml(xml);
    return { articles };
  } catch (err) {
    console.error("PubMed API error", err);
    return { articles: [] };
  }
}
