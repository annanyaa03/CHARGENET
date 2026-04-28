import gradio as gr
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from PIL import Image
import os
import time
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
MODEL_ID = "runwayml/stable-diffusion-v1-5"
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# Initialize Supabase
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase initialization failed: {e}")

# Global pipeline variable for caching
pipe = None

def load_pipeline():
    global pipe
    if pipe is None:
        print("Loading pipeline...")
        # Use float32 for CPU inference
        pipe = StableDiffusionPipeline.from_pretrained(
            MODEL_ID, 
            torch_dtype=torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        )
        # Use a faster scheduler
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
        pipe.to("cpu")
        # Enable attention slicing for lower memory usage
        pipe.enable_attention_slicing()
    return pipe

def save_and_upload(image, prompt):
    if supabase is None:
        return None
    
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"char_{timestamp}.png"
        filepath = f"/tmp/{filename}"
        image.save(filepath)
        
        # Upload to Supabase 'images' bucket
        with open(filepath, "rb") as f:
            supabase.storage.from_("images").upload(
                path=filename,
                file=f,
                file_options={"content-type": "image/png"}
            )
        
        # Get public URL
        public_url = supabase.storage.from_("images").get_public_url(filename)
        return public_url
    except Exception as e:
        print(f"Upload failed: {e}")
        return None

def generate_character(prompt, seed, steps, progress=gr.Progress()):
    start_time = time.time()
    
    try:
        progress(0, desc="Initializing engine...")
        pipeline = load_pipeline()
        
        # Set seed
        generator = torch.Generator("cpu").manual_seed(int(seed))
        
        progress(0.2, desc="Generating character...")
        # Add character-specific modifiers to prompt
        full_prompt = f"character portrait of {prompt}, detailed concept art, digital painting, high resolution, 512x512"
        negative_prompt = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry"
        
        image = pipeline(
            full_prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=int(steps),
            generator=generator,
            guidance_scale=7.5
        ).images[0]
        
        progress(0.9, desc="Finalizing...")
        inference_time = time.time() - start_time
        
        # Handle storage
        public_url = save_and_upload(image, prompt)
        
        status = f"✅ Generated in {inference_time:.1f}s"
        if public_url:
            status += f" | [Stored in Cloud]({public_url})"
            
        return image, status
    except Exception as e:
        return None, f"❌ Error: {str(e)}"

# Premium Theme
theme = gr.themes.Soft(
    primary_hue="indigo",
    secondary_hue="slate",
    neutral_hue="slate",
    font=[gr.themes.GoogleFont("Outfit"), "ui-sans-serif", "system-ui", "sans-serif"],
).set(
    body_background_fill="*neutral_50",
    block_background_fill="*neutral_100",
    button_primary_background_fill="*primary_500",
    button_primary_text_color="white",
)

# Custom HTML for Share Buttons
share_html = """
<div style="display: flex; gap: 12px; margin-top: 15px; justify-content: center;">
    <a href="https://twitter.com/intent/tweet?text=Check%20out%20my%20AI%20character%20generated%20on%20CHARGENET!%20🚀" target="_blank">
        <button style="background: #1DA1F2; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            Share on Twitter
        </button>
    </a>
    <a href="https://discord.com" target="_blank">
        <button style="background: #5865F2; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993.023.03.063.04.084.028a19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.156 2.419z"/></svg>
            Join Discord
        </button>
    </a>
</div>
"""

# Build UI
with gr.Blocks(theme=theme, title="CHARGENET - AI Character Generator") as demo:
    gr.Markdown(
        """
        # 🎭 CHARGENET
        ### Next-Gen AI Character Generator
        
        Unleash your imagination. Generate high-quality character concept art in seconds.
        """
    )
    
    with gr.Row():
        with gr.Column(scale=1):
            prompt = gr.Textbox(
                label="Character Prompt", 
                placeholder="e.g. fantasy warrior with glowing armor...",
                lines=3
            )
            
            with gr.Accordion("Advanced Settings", open=False):
                seed = gr.Slider(0, 1000000, value=42, label="Seed", step=1)
                steps = gr.Slider(10, 30, value=15, label="Inference Steps", step=1)
            
            generate_btn = gr.Button("Generate Character 🚀", variant="primary")
            
            gr.Examples(
                examples=[
                    ["fantasy warrior, ethereal armor, forest background", 42, 15],
                    ["cyberpunk hacker, neon lights, rainy city street", 123, 20],
                    ["elven archer, golden bow, sunlight through trees", 777, 15]
                ],
                inputs=[prompt, seed, steps]
            )
            
        with gr.Column(scale=2):
            output_img = gr.Image(label="Generated Character", type="pil", interactive=False)
            status_text = gr.Markdown("Ready to generate. First load may take a moment to cache the model.")
            gr.HTML(share_html)

    generate_btn.click(
        fn=generate_character,
        inputs=[prompt, seed, steps],
        outputs=[output_img, status_text]
    )

if __name__ == "__main__":
    demo.launch()
