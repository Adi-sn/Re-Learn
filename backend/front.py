# front.py

import gradio as gr

# Import the backend logic functions from your survey.py file
from survey import process_turn, get_initial_state, TARGET_LANGUAGE

def chat_interface(message: str, chat_history: list, state: dict):
    """
    The Gradio-specific function that interfaces with the backend.
    """
    # 1. Update chat history with the user's message
    chat_history.append((message, None))
    
    # 2. Call the backend logic to process the user's input and get the new state
    new_state = process_turn(user_input=message, current_state=state)
    
    # 3. Update the chat history with the bot's response from the new state
    chat_history[-1] = (message, new_state['bot_message'])
    
    # 4. Extract the final JSON result (if available)
    final_json_result = new_state.get('final_result', None)
    
    # 5. Return all the updated components for the Gradio UI
    return "", chat_history, new_state, final_json_result

def reset_chat():
    """
    Resets the chat to its initial state by calling the backend's initializer.
    """
    initial_state = get_initial_state()
    initial_message = initial_state['bot_message']
    
    return "", [(None, initial_message)], initial_state, None

# --- Build the Gradio UI ---
with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown(f"# 🇫🇷 {TARGET_LANGUAGE} Proficiency Assessment Demo")
    gr.Markdown("This demo uses a multi-stage conversational flow and Gemini to assess your language level. The UI is separated from the core logic.")

    # Get the initial state from the backend to initialize the UI
    initial_state = get_initial_state()
    
    # This holds the session state as a dictionary
    state = gr.State(value=initial_state)

    with gr.Row():
        with gr.Column(scale=2):
            chatbot = gr.Chatbot(
                value=[(None, initial_state['bot_message'])],
                label="Conversation",
                # REMOVED: bubble_fill argument to support older Gradio versions
                height=500
            )
            msg_box = gr.Textbox(
                placeholder=f"Type your response...",
                label="Your response",
                show_label=False
            )
        with gr.Column(scale=1):
            gr.Markdown("### Backend Assessment Result")
            gr.Markdown("The final JSON output from the Gemini evaluator will appear here when the assessment is complete.")
            json_output = gr.JSON(label="Final Result", scale=2)
            clear_btn = gr.Button("🔄 Clear and Restart Assessment")

    # Wire up the event handlers
    msg_box.submit(
        chat_interface,
        [msg_box, chatbot, state],
        [msg_box, chatbot, state, json_output]
    )
    clear_btn.click(
        reset_chat,
        [],
        [msg_box, chatbot, state, json_output]
    )

if __name__ == "__main__":
    demo.launch()