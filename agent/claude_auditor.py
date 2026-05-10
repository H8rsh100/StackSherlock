import os
import json
import anthropic

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")

def audit_git_diff(git_diff: str) -> dict:
    """
    Step 5: Claude Diff Audit.
    Takes a raw git diff and returns a JSON risk analysis.
    """
    if not ANTHROPIC_API_KEY:
        return {"error": "ANTHROPIC_API_KEY is not set."}

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    
    system_prompt = """You are a senior SRE engineer conducting a code audit.
You do not know about the incident context.
Your only job is to audit the git diff provided."""

    user_prompt = f"""Here is a git diff from a recent deployment.
Determine if this change could cause:
- connection pool exhaustion
- auth service degradation  
- memory leak under load

Return ONLY valid JSON exactly in this format, with no other text or markdown:
{{
  "verdict": "HIGH_RISK | MEDIUM_RISK | LOW_RISK",
  "affected_lines": ["line 42", "line 67"],
  "reasoning": "...",
  "confidence": 0-100
}}

Diff:
{git_diff}
"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            temperature=0.2,
            system=system_prompt,
            messages=[
                {"role": "user", "content": user_prompt}
            ]
        )
        
        # Parse Claude's JSON response
        result_text = response.content[0].text
        
        # Clean up in case Claude included markdown formatting
        if result_text.startswith("```json"):
            result_text = result_text.replace("```json", "").replace("```", "").strip()
        elif result_text.startswith("```"):
            result_text = result_text.replace("```", "").strip()
            
        return json.loads(result_text)
    except Exception as e:
        return {"error": f"Failed to audit diff with Claude: {str(e)}"}
