import os
import json
import google.generativeai as genai

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def generate_hypotheses_and_confidence(investigation_context: dict, claude_audit: dict) -> dict:
    """
    Steps 6-7: Hypothesis Generation and Confidence Engine using Gemini.
    Takes the context from Steps 1-4 and the Claude audit from Step 5.
    Returns ranked hypotheses and a weighted signal breakdown.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY is not set."}

    genai.configure(api_key=GEMINI_API_KEY)
    
    model = genai.GenerativeModel(
        model_name='gemini-1.5-pro',
        system_instruction="You are StackSherlock, an elite SRE reasoning engine. Your task is to analyze signals, rank hypotheses, and generate a weighted confidence breakdown."
    )
    
    prompt = f"""
    Based on the following incident investigation context and code audit:
    
    Context (Elastic, MongoDB, GitLab, Blast Radius):
    {json.dumps(investigation_context, indent=2)}
    
    Code Audit (from Claude):
    {json.dumps(claude_audit, indent=2)}
    
    Please perform the following:
    1. Generate 3 ranked hypotheses for the root cause.
    2. Select the most likely hypothesis and explain why.
    3. Generate a confidence breakdown using the collected signals. Assign a point value to each signal (e.g., 31, 18) based on its strength. The sum of these signal scores MUST exactly equal the total confidence score of the selected hypothesis.
    
    Return ONLY valid JSON in the exact following structure with no markdown or formatting:
    {{
      "hypotheses": [
        {{"label": "Hypothesis 1", "confidence": 94}},
        {{"label": "Hypothesis 2", "confidence": 61}},
        {{"label": "Hypothesis 3", "confidence": 37}}
      ],
      "selected_hypothesis": 0,
      "reasoning": "Agent selected 0 because...",
      "total_confidence": 94,
      "confidence_signals": [
        {{"signal": "Deployment timestamp matches spike", "score": 31}},
        {{"signal": "Similar incident found March 14th", "score": 18}},
        {{"signal": "Memory leak logs detected", "score": 22}},
        {{"signal": "Failing endpoint isolated", "score": 11}},
        {{"signal": "Code diff affects auth pooling", "score": 12}}
      ]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text
        
        # Clean up JSON markdown if model outputs it despite instructions
        if result_text.startswith("```json"):
            result_text = result_text.replace("```json", "").replace("```", "").strip()
        elif result_text.startswith("```"):
            result_text = result_text.replace("```", "").strip()
            
        return json.loads(result_text)
    except Exception as e:
        return {"error": f"Failed to generate hypotheses: {str(e)}"}
