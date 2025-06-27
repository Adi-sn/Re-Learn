import gradio as gr
import nest_asyncio

from chains import (
    ConversationManager,
    LESSON_CONFIG,
    audio_input,
    audio_output
)

async def voice_chat_interface(audio_in, chat_history, convo_manager, selected_lesson):
    """The main function that orchestrates the I/O for the Gradio app."""
    if not selected_lesson:
        error_msg = "Please select a lesson first!"
        return None, chat_history, convo_manager, error_msg, ""
        
    if convo_manager is None:
        print(f"Creating new ConversationManager for lesson: {selected_lesson}")
        convo_manager = ConversationManager(lesson_id=selected_lesson)

    user_text = audio_input(audio_in)
    if not user_text:
        return None, chat_history, convo_manager, "N/A", "N/A"

    response = await convo_manager.chat(user_text)
    ai_text_reply = response.get('reply', "I'm sorry, I couldn't generate a response.")
    feedback = response.get('feedback', {})
    
    ai_audio_reply = audio_output(ai_text_reply)
    
    chat_history.append((user_text, ai_text_reply))
    
    correction = feedback.get('correction', '')
    explanation = feedback.get('explanation', '¡Buen trabajo!')

    return ai_audio_reply, chat_history, convo_manager, correction, explanation

def clear_chat():
    """Resets all UI components and the conversation state."""
    print("Clearing chat state.")
    return None, None, None, "N/A", "N/A"

def on_lesson_change():
    """Handler to clear chat when a new lesson is selected."""
    return clear_chat()

with gr.Blocks(theme=gr.themes.Soft(), title="Voice-Based Language Companion") as demo:
    convo_manager_state = gr.State(value=None)
    gr.Markdown("# 🎙️ Voice-Based Language Learning Companion")

    with gr.Row():
        with gr.Column(scale=2):
            lesson_selector = gr.Dropdown(
                choices=list(LESSON_CONFIG.keys()),
                label="Select a Lesson",
                value="coffee_shop"
            )
            chatbot = gr.Chatbot(label="Conversation Log", height=400, bubble_full_width=False)
            audio_in = gr.Audio(sources=["microphone"], type="filepath", label="Speak Here")
        
        with gr.Column(scale=1):
            audio_out = gr.Audio(label="Companion's Reply", autoplay=True)
            gr.Markdown("## 💡 Instant Feedback")
            correction_box = gr.Textbox(label="Suggested Correction", interactive=False)
            explanation_box = gr.Textbox(label="Explanation", interactive=False, lines=4)
            clear_button = gr.Button("🗑️ Clear Chat")

    audio_in.change(
        fn=voice_chat_interface,
        inputs=[audio_in, chatbot, convo_manager_state, lesson_selector],
        outputs=[audio_out, chatbot, convo_manager_state, correction_box, explanation_box]
    )
    
    clear_button.click(
        fn=clear_chat,
        inputs=[],
        outputs=[audio_out, chatbot, convo_manager_state, correction_box, explanation_box]
    )
    
    lesson_selector.change(
        fn=on_lesson_change,
        inputs=[],
        outputs=[audio_out, chatbot, convo_manager_state, correction_box, explanation_box]
    )

if __name__ == "__main__":
    nest_asyncio.apply()
    demo.launch(debug=True)