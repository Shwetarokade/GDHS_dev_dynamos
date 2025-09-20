import type { CaseMatcherInput, CaseMatcherOutput } from "./types";

const BIOPORTAL_API_URL = "https://data.bioontology.org/search";

function getBioPortalApiKey() {
  return process.env.BIOPORTAL_API_KEY || "";
}

// Case Matcher Agent: BioPortal API integration
export async function matchCase(input: CaseMatcherInput): Promise<CaseMatcherOutput> {
  const { newCase } = input;
  const apiKey = getBioPortalApiKey();
  const query = encodeURIComponent(newCase?.condition || "");
  const url = `${BIOPORTAL_API_URL}?q=${query}&require_exact_match=false&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("BioPortal API error");
    const data = await response.json();
    // data.collection contains ontology matches
    const matchedCases = (data.collection || []).map((item: any) => ({
      prefLabel: item.prefLabel,
      ontology: item.links.ontology,
      matchType: item.matchType,
      id: item['@id']
    }));
    return { matchedCases };
  } catch (err) {
    console.error("BioPortal API error", err);
    return { matchedCases: [] };
  }
}
