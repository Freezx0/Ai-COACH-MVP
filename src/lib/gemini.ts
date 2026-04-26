import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    decision: {
      type: Type.OBJECT,
      properties: {
        openBusiness: { type: Type.STRING, description: "YES or NO" },
        loanDecision: { type: Type.STRING, description: "APPROVE or REJECT" },
        confidence: { type: Type.INTEGER, description: "Confidence level 0-100" }
      },
      required: ["openBusiness", "loanDecision", "confidence"]
    },
    metrics: {
      type: Type.OBJECT,
      properties: {
        marketSaturation: { type: Type.INTEGER, description: "Market saturation percentage" },
        locationScore: { type: Type.INTEGER, description: "Location score 0-100" },
        demandLevel: { type: Type.STRING, description: "Low, Medium, or High" },
        roi: { type: Type.INTEGER, description: "Expected ROI percentage" },
        breakEvenMonths: { type: Type.INTEGER, description: "Break-even time in months" },
        riskPD: { type: Type.INTEGER, description: "Probability of default (risk) percentage" }
      },
      required: ["marketSaturation", "locationScore", "demandLevel", "roi", "breakEvenMonths", "riskPD"]
    },
    reasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 bullet points of reasons"
    },
    improvements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Suggestions to make the business viable"
    },
    chartData: {
      type: Type.OBJECT,
      properties: {
        revenue: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.STRING },
              actual: { type: Type.INTEGER },
              predicted: { type: Type.INTEGER },
              season: { type: Type.STRING }
            },
            required: ["month", "actual", "predicted", "season"]
          }
        },
        traffic: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              foot: { type: Type.INTEGER },
              car: { type: Type.INTEGER }
            },
            required: ["time", "foot", "car"]
          }
        },
        cashflow: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.STRING },
              balance: { type: Type.INTEGER }
            },
            required: ["month", "balance"]
          }
        },
        competitors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              A: { type: Type.INTEGER },
              B: { type: Type.INTEGER },
              fullMark: { type: Type.INTEGER }
            },
            required: ["subject", "A", "B", "fullMark"]
          }
        }
      },
      required: ["revenue", "traffic", "cashflow", "competitors"]
    },
    financialDetails: {
      type: Type.OBJECT,
      properties: {
        initialInvestment: { type: Type.INTEGER, description: "Initial investment in USD" },
        breakEvenRevenue: { type: Type.INTEGER, description: "Break even revenue per month in USD" },
        averageOrderValue: { type: Type.NUMBER, description: "Average order value in USD" },
        cac: { type: Type.NUMBER, description: "Customer Acquisition Cost" },
        cogs: { type: Type.NUMBER, description: "Cost of Goods Sold" },
        ltv: { type: Type.NUMBER, description: "Life Time Value" },
        tam: { type: Type.STRING, description: "Total Addressable Market in USD (e.g. '$12.5M')" },
        sam: { type: Type.STRING, description: "Serviceable Available Market in USD (e.g. '$4.2M')" },
        som: { type: Type.STRING, description: "Serviceable Obtainable Market in USD (e.g. '$850K')" }
      },
      required: ["initialInvestment", "breakEvenRevenue", "averageOrderValue", "cac", "cogs", "ltv", "tam", "sam", "som"]
    }
  },
  required: ["decision", "metrics", "reasons", "improvements", "chartData", "financialDetails"]
};

export interface BusinessAnalysis {
  decision: {
    openBusiness: "YES" | "NO";
    loanDecision: "APPROVE" | "REJECT";
    confidence: number;
  };
  metrics: {
    marketSaturation: number;
    locationScore: number;
    demandLevel: "Low" | "Medium" | "High";
    roi: number;
    breakEvenMonths: number;
    riskPD: number;
  };
  reasons: string[];
  improvements: string[];
  chartData: {
    revenue: { month: string; actual: number; predicted: number; season: string }[];
    traffic: { time: string; foot: number; car: number }[];
    cashflow: { month: string; balance: number }[];
    competitors: { subject: string; A: number; B: number; fullMark: number }[];
  }
  financialDetails: {
    initialInvestment: number;
    breakEvenRevenue: number;
    averageOrderValue: number;
    cac: number;
    cogs: number;
    ltv: number;
    tam: string;
    sam: string;
    som: string;
  }
}

export async function analyzeBusiness(businessType: string, location: string, assumptions?: string): Promise<BusinessAnalysis> {
  const prompt = `You are a bank-level AI Business Decision Engine.

Your goal is to evaluate a business idea using market data, location intelligence, demand forecasting, financial modeling, and risk analysis.

Answer the core question:
"Should this business be opened in this location, and should the bank finance it?"

---

## INPUT:
* Business type: ${businessType}
* Location: ${location}
* Assumptions: ${assumptions || "None provided"}

---

## ANALYSIS LOGIC:
1. MARKET ANALYSIS
* Estimate demand level
* Evaluate market saturation (0-100)
* Identify if there is a gap or oversupply
* Estimate TAM, SAM, and SOM realistically.

2. DEMAND FORECAST
* Predict revenue trend (low / medium / high) over 12 months array for 'revenue' chart data.
* Consider seasonality (holidays, local behavior)

3. LOCATION ANALYSIS
* Score location (0-100)
* Consider foot traffic and accessibility based on the location. Generate 'traffic' chart data.
* Check nearby competitors and generate 'competitors' chart data.

4. FINANCIAL ANALYSIS
* Estimate profitability (ROI)
* Estimate break-even (months)
* Provide unit economics: CAC, COGS, AOV, LTV.
* Provide cashflow array representing monthly balance for the next 8 months (including negative startup months).

5. RISK ANALYSIS
* Estimate Probability of Default (PD %)
* Classify risk: Low / Medium / High

---

## DECISION RULES:
* If saturation > 80 AND demand low -> NO
* If ROI < 0 -> NO
* If risk HIGH -> reduce approval chance

---
Generate output conforming to the provided JSON schema. Ensure the charts array lengths are appropriate (revenue: 12, traffic: 8, cashflow: 8, competitors: 6). Be concise, realistic, and think like a bank risk director.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      }
    });

    const data = JSON.parse(response.text || "{}") as BusinessAnalysis;
    return data;
  } catch (error) {
    console.error("Error generating business analysis:", error);
    throw error;
  }
}
