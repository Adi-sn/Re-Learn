import gradio as gr
import nest_asyncio

from chains import (
    ConversationManager,
    audio_input,
    audio_output
)

async def chat_interface(user_input_text, audio_in, chat_history, convo_manager):
    """The main function that orchestrates the I/O for the Gradio app."""
    if convo_manager is None:
        print(f"Creating new ConversationManager")
        convo_manager = ConversationManager()
        # Initial message for the survey
        initial_survey_message = convo_manager.survey_state['bot_message']
        chat_history.append((None, initial_survey_message))
        return None, chat_history, convo_manager, "", "", "", "", gr.update(visible=True), gr.update(visible=False)

    user_text = ""
    ai_audio_reply = None
    if convo_manager.survey_state['stage'] != 'complete':
        user_text = user_input_text
        if not user_text:
            return None, chat_history, convo_manager, "N/A", "N/A", "", "", gr.update(visible=True), gr.update(visible=False)
    else:
        user_text = audio_input(audio_in)
        if not user_text:
            return None, chat_history, convo_manager, "N/A", "N/A", "", "", gr.update(visible=False), gr.update(visible=True)

    response = await convo_manager.chat(user_text)
    ai_text_reply = response.get('reply', "I'm sorry, I couldn't generate a response.")
    feedback = response.get('feedback', {})
    
    if convo_manager.survey_state['stage'] == 'complete':
        ai_audio_reply = audio_output(ai_text_reply, convo_manager.cefr_level)
        chat_history.append((user_text, ai_text_reply))
        return ai_audio_reply, chat_history, convo_manager, feedback.get('correction', ''), feedback.get('explanation', '¡Buen trabajo!'), convo_manager.cefr_level, convo_manager.scenario_description, gr.update(visible=False), gr.update(visible=True)
    else:
        chat_history.append((user_text, ai_text_reply))
        return None, chat_history, convo_manager, "", "", "", "", gr.update(visible=True), gr.update(visible=False)

def clear_chat():
    """Resets all UI components and the conversation state."""
    print("Clearing chat state.")
    return None, None, None, "N/A", "N/A", "", "", gr.update(visible=True), gr.update(visible=False)



with gr.Blocks(theme=gr.themes.Soft(), title="Voice-Based Language Companion") as demo:
    convo_manager_state = gr.State(value=None)
    gr.Markdown("# 🎙️ Voice-Based Language Learning Companion")

    with gr.Row():
        with gr.Column(scale=2):
            scenario_display = gr.Textbox(label="Roleplay Scenario", interactive=False, lines=3)
            chatbot = gr.Chatbot(label="Conversation Log", height=400, bubble_full_width=False)
            user_input_text = gr.Textbox(label="Type your answer here (for survey)", visible=True)
            audio_in = gr.Audio(sources=["microphone"], type="filepath", label="Speak Here (for roleplay)", visible=False)
        
        with gr.Column(scale=1):
            audio_out = gr.Audio(label="Companion's Reply", autoplay=True)
            gr.Markdown("## 💡 Instant Feedback")
            correction_box = gr.Textbox(label="Suggested Correction", interactive=False)
            explanation_box = gr.Textbox(label="Explanation", interactive=False, lines=4)
            cefr_level_display = gr.Textbox(label="CEFR Level", interactive=False)
            clear_button = gr.Button("🗑️ Clear Chat")

    user_input_text.submit(
        fn=chat_interface,
        inputs=[user_input_text, audio_in, chatbot, convo_manager_state],
        outputs=[audio_out, chatbot, convo_manager_state, correction_box, explanation_box, cefr_level_display, scenario_display, user_input_text, audio_in]
    )
    
    audio_in.change(
        fn=chat_interface,
        inputs=[user_input_text, audio_in, chatbot, convo_manager_state],
        outputs=[audio_out, chatbot, convo_manager_state, correction_box, explanation_box, cefr_level_display, scenario_display, user_input_text, audio_in]
    )
    
    clear_button.click(
        fn=clear_chat,
        inputs=[],
        outputs=[audio_out, chatbot, convo_manager_state, correction_box, explanation_box, cefr_level_display, scenario_display, user_input_text, audio_in]
    )
    
    

if __name__ == "__main__":
    nest_asyncio.apply()
    demo.launch(debug=True)