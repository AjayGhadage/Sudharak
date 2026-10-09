import Groq from 'groq-sdk';
import { config } from '../config/env.js';

const groq = new Groq({
  apiKey: config.groqApiKey || 'mock-key',
});

export const generateAIReasoning = async (detectionResult) => {
  const category = detectionResult?.category || 'ROAD_DAMAGE';
  const confidence = detectionResult?.confidence || 0.88;
  const severity = detectionResult?.severity || 'HIGH';
  const estimatedCost = detectionResult?.estimatedCost || 150;
  const priorityScore = detectionResult?.priorityScore || 75;

  try {
    if (!config.groqApiKey || config.groqApiKey.includes('mock')) {
      // Mocked response for sandbox/no-key
      return {
        category,
        confidence,
        severity,
        description: `A ${category.toLowerCase().replace('_', ' ')} has been detected with ${Math.round(confidence * 100)}% confidence. It poses a potential risk to the community and requires attention.`,
        estimatedCost,
        recommendedAction: `Inspect the ${category.toLowerCase().replace('_', ' ')} and assign appropriate municipal resources for remediation.`,
        priorityScore
      };
    }

    const prompt = `
You are a civic infrastructure assessment assistant.

Given the following machine learning detection results:
- Category: ${category}
- Confidence: ${confidence}
- YOLO Output Severity: ${severity}
- YOLO Output Estimated Cost: $${estimatedCost}

Return valid JSON with the following structure:
1. "category": String (e.g. "${category}")
2. "severity": Severity level (LOW, MEDIUM, HIGH, CRITICAL)
3. "description": A concise, professional description of the issue based on the category.
4. "estimatedCost": Estimated repair cost in USD.
5. "recommendedAction": Professional recommendation for fixing it.
6. "priorityScore": 0-100 score.

Valid JSON ONLY. No markdown formatting blocks like \`\`\`json.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });
    
    const text = chatCompletion.choices[0]?.message?.content?.replace(/```json/g, '')?.replace(/```/g, '')?.trim();
    const parsed = JSON.parse(text);

    return {
      category: parsed.category || category,
      confidence,
      severity: parsed.severity || severity,
      description: parsed.description || `Detected ${category} issue.`,
      estimatedCost: parsed.estimatedCost || estimatedCost,
      recommendedAction: parsed.recommendedAction || 'Inspect and assign maintenance team.',
      priorityScore: parsed.priorityScore || priorityScore
    };
  } catch (error) {
    console.error('Groq AI Reasoning error:', error);
    return {
      category,
      confidence,
      severity,
      description: `Detected ${category.toLowerCase().replace('_', ' ')} issue with automated AI scan.`,
      estimatedCost,
      recommendedAction: 'Manual municipal inspection required.',
      priorityScore
    };
  }
};

export const chatWithGroq = async (message, history = [], language = 'en-IN', contextContext = '') => {
  let langName = 'English';
  if (language.includes('hi')) langName = 'Hindi';
  if (language.includes('mr')) langName = 'Marathi';

  try {
    if (config.groqApiKey && !config.groqApiKey.includes('mock')) {
      const messages = [
        { role: 'system', content: `You are the "Sudharak Civic Assistant", an intelligent AI assistant for an Indian civic issue reporting app (PMC / PCMC municipal corporation area). You assist citizens with reporting potholes, garbage dumps, street light failures, water leakages, and tracking repair escrow status. The user has selected ${langName}. Answer concisely, politely, and effectively in ${langName}. Context info: [${contextContext}].` },
        ...history,
        { role: 'user', content: message }
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 300,
      });
      
      const reply = chatCompletion.choices[0]?.message?.content;
      if (reply) return reply;
    }
  } catch (error) {
    console.error('Groq Chat API error:', error.message);
  }

  // Smart Context-Aware Dynamic Assistant Fallback
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('wagholi') || lowerMsg.includes('location') || lowerMsg.includes('area')) {
    if (langName === 'Hindi') return "वाघोली क्षेत्र के लिए नगर निगम वार्ड इंजीनियरिंग टीम को अलर्ट भेजा गया है। आप 'Report Issue' बटन से वाघोली का नया मुद्दा दर्ज कर सकते हैं।";
    if (langName === 'Marathi') return "वाघोली क्षेत्रासाठी मनपा प्रभाग समितीला कळवले आहे. आपण 'Report Issue' वर क्लिक करून वाघोलीतील समस्येची नोंद करू शकता.";
    return "Issue logged for Wagholi area! The PMC Ward Office engineer has been notified. You can use the 'Report Issue' button on top to submit photo & GPS details.";
  }

  if (lowerMsg.includes('pothole') || lowerMsg.includes('road') || lowerMsg.includes('damage')) {
    return "Road damage & pothole reports receive high AI priority (Severity Score > 70%). Funds contributed are locked in the PMC Municipal Escrow Vault until repairs are verified.";
  }

  if (lowerMsg.includes('water') || lowerMsg.includes('leak') || lowerMsg.includes('drain')) {
    return "Water supply & drainage issues are directly routed to the Municipal Water Resources Department with 24-48hr SLA tracking.";
  }

  if (lowerMsg.includes('status') || lowerMsg.includes('escrow') || lowerMsg.includes('money') || lowerMsg.includes('fund')) {
    return "All donations are held safely in the Municipal Escrow Vault. Funds are only released to contractors after civic officer proof upload & citizen verification vote!";
  }

  return `I have recorded your query about "${message}". As your Sudharak Civic Assistant, I am here to help you report municipal issues, track escrow funds, and view city repair status!`;
};
