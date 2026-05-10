import os
import google.generativeai as genai
from .tools import elastic_search_logs, estimate_blast_radius, gitlab_get_deployments, mongo_get_historical_incidents

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

def run_agent_investigation_steps_1_to_4(service_name: str, timestamp: str, pattern: str) -> dict:
    """
    Executes Steps 1-4 of the agent flow using Gemini with Automatic Function Calling.
    """
    if not GEMINI_API_KEY:
        return {"error": "GEMINI_API_KEY environment variable is not set."}
        
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Initialize the model with our MCP tools
    model = genai.GenerativeModel(
        model_name='gemini-1.5-pro',
        tools=[elastic_search_logs, estimate_blast_radius, gitlab_get_deployments, mongo_get_historical_incidents],
        system_instruction="You are StackSherlock, an autonomous incident command agent. Use your tools to investigate incidents."
    )
    
    chat = model.start_chat(enable_automatic_function_calling=True)
    
    prompt = f"""
    An incident was just triggered for '{service_name}' at '{timestamp}'. 
    Perform the following investigation steps:
    1. Search Elastic logs for '{service_name}'.
    2. Estimate the blast radius for affected services (assume '{service_name}' and 'checkout-api').
    3. Check GitLab for recent deployments around the timestamp.
    4. Query MongoDB for historical precedents matching pattern '{pattern}'.
    
    Summarize your findings from these 4 steps in JSON format.
    """
    
    response = chat.send_message(prompt)
    
    # Extract tool calls made by the agent for logging/transparency
    tool_calls = []
    for step in chat.history:
        for part in step.parts:
            if hasattr(part, 'function_call') and part.function_call:
                tool_calls.append(part.function_call.name)
    
    return {
        "status": "success",
        "agent_summary": response.text,
        "tool_calls_made": list(set(tool_calls))
    }
