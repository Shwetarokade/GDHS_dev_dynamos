import type { TreatmentRecommenderInput, TreatmentRecommenderOutput } from "./types";

const RXNAV_RXCUI_API_URL = "https://rxnav.nlm.nih.gov/REST/rxcui.json";
const RXNORM_DRUGS_API = "https://rxnav.nlm.nih.gov/REST/drugs.json";

// Treatment Recommender Agent: Drug/Non-drug API integration
export async function recommendTreatment(input: TreatmentRecommenderInput): Promise<TreatmentRecommenderOutput> {
  const { condition } = input;
  try {
    // Step 1: Get RxCUI for the condition (drug name)
    const rxcuiUrl = `${RXNAV_RXCUI_API_URL}?name=${encodeURIComponent(condition)}`;
    const rxcuiRes = await fetch(rxcuiUrl);
    if (!rxcuiRes.ok) throw new Error("RxNav API error");
    const rxcuiData = await rxcuiRes.json();
    const rxcui = rxcuiData.idGroup?.rxnormId?.[0];
    if (!rxcui) return { recommendations: [] };

    // Step 2: Fetch drug info from RxNorm
    const drugsUrl = `${RXNORM_DRUGS_API}?rxcui=${rxcui}`;
    const drugsRes = await fetch(drugsUrl);
    if (!drugsRes.ok) throw new Error("RxNorm drugs API error");
    const drugsData = await drugsRes.json();
    const drugGroup = drugsData.drugGroup || {};
    const conceptGroup = drugGroup.conceptGroup || [];
    const recommendations: Array<string|{name:string;type?:string;urgency?:string;}> = [];
    conceptGroup.forEach((group: any) => {
      if (group.conceptProperties) {
        group.conceptProperties.forEach((prop: any) => {
          recommendations.push({
            name: prop.name,
            type: group.tty,
            urgency: undefined
          });
        });
      }
    });
    if (recommendations.length === 0) {
      recommendations.push({ name: `Consider RxNorm drug with RxCUI: ${rxcui}` });
    }
    return { recommendations };
  } catch (err) {
    console.error("RxNav/RxNorm API error", err);
    return { recommendations: [] };
  }
}
