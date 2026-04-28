import gradio as gr
import numpy as np
import onnxruntime as ort
from PIL import Image
import os
import time
from fastapi import FastAPI

# Configuration
MODEL_PATH = "model.onnx"
LATENT_DIM = 64

# Initialize ONNX session
def load_session():
    if not os.path.exists(MODEL_PATH):
        # Create a dummy ONNX model if not exists to prevent crash on Vercel boot
        # In a real scenario, export_onnx.py should be run first
        print(f"Model not found at {MODEL_PATH}. Inference will fail until model is provided.")
        return None
    try:
        session = ort.InferenceSession(MODEL_PATH, providers=['CPUExecutionProvider'])
        return session
    except Exception as e:
        print(f"Error loading ONNX model: {e}")
        return None

session = load_session()

def generate_character(seed, style_intensity, complexity):
    if session is None:
        return None, "Error: Model not loaded. Run export_onnx.py first."
    
    # Set seed for reproducibility
    np.random.seed(int(seed))
    
    # Generate latent vector
    z = np.random.randn(1, LATENT_DIM).astype(np.float32)
    
    # Apply style intensity and complexity tweaks
    z = z * style_intensity + (complexity * 0.1)
    
    # Inference
    start_time = time.time()
    outputs = session.run(None, {'input': z})
    inference_time = time.time() - start_time
    
    # Post-process: [-1, 1] -> [0, 255]
    img_data = outputs[0][0] # Shape (3, 64, 64)
    img_data = ((img_data + 1) * 127.5).clip(0, 255).astype(np.uint8)
    img_data = img_data.transpose(1, 2, 0) # (64, 64, 3)
    
    # Upscale for "Progressive Enhancement" feel
    img = Image.fromarray(img_data)
    img = img.resize((512, 512), Image.Resampling.LANCZOS)
    
    return img, f"Generated in {inference_time:.2f}s (CPU-optimized)"

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

app = FastAPI()

with gr.Blocks(theme=theme, title="ChargeNet AI Character Gen") as demo:
    gr.Markdown(
        """
        # 🎭 AI Character Generator
        ### Powered by ChargeNet Neural Engine (ONNX Optimized)
        
        Generate unique character concepts using generative AI. CPU-optimized for fast serverless inference.
        """
    )
    
    with gr.Row():
        with gr.Column(scale=1):
            seed = gr.Number(label="Seed", value=42, precision=0, info="Random seed for reproducibility")
            style = gr.Slider(minimum=0.1, maximum=2.0, value=1.0, label="Style Intensity", info="Adjust the variance of features")
            complexity = gr.Slider(minimum=1, maximum=10, value=5, label="Complexity Detail", info="Fine-tune character complexity")
            
            generate_btn = gr.Button("Generate Character 🚀", variant="primary")
            
        with gr.Column(scale=2):
            output_img = gr.Image(label="Generated Character", type="pil", interactive=False)
            status_text = gr.Markdown("Ready to generate.")
            
            with gr.Row():
                gr.HTML(
                    """
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <a href="https://twitter.com/intent/tweet?text=Look%20at%20this%20AI%20character%20I%20generated%20on%20ChargeNet!" target="_blank" style="text-decoration: none;">
                            <button style="background: #1DA1F2; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: bold;">Twitter Share</button>
                        </a>
                        <a href="https://discord.com" target="_blank" style="text-decoration: none;">
                            <button style="background: #5865F2; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-weight: bold;">Discord</button>
                        </a>
                    </div>
                    """
                )

    generate_btn.click(
        fn=generate_character,
        inputs=[seed, style, complexity],
        outputs=[output_img, status_text],
        show_progress="full"
    )
    
    gr.Markdown(
        """
        ---
        **Pro Tip:** Use the same seed with different style intensities to see variants of the same character base.
        """
    )

# Mount Gradio to FastAPI
app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
