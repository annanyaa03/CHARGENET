# 🚀 Deploying ChargeNet AI Character Generator

This guide covers how to deploy the Gradio character generation app to **Vercel** and **Hugging Face Spaces**.

## 🛠 Local Setup & Model Export

Before deploying, you must generate the ONNX model file.

1.  **Install requirements:**
    ```bash
    pip install torch onnx
    ```
2.  **Export the model:**
    ```bash
    python export_onnx.py
    ```
    This will create `model.onnx` in the root directory.

---

## ⚡ Deployment to Vercel (Recommended for Integration)

Vercel is great for hosting the app alongside your existing project.

1.  **Install Vercel CLI:**
    ```bash
    npm install -g vercel
    ```
2.  **Deploy:**
    ```bash
    vercel --prod
    ```
    The `vercel.json` and `requirements.txt` are already optimized for CPU-only inference within Vercel's 10s timeout.

---

## 🤗 Deployment to Hugging Face Spaces (Best for ML)

If you experience timeouts or want a more robust ML hosting environment, use HF Spaces.

1.  **Create a New Space:**
    - Go to [huggingface.co/new-space](https://huggingface.co/new-space).
    - Select **Gradio** as the SDK.
2.  **Upload Files:**
    - `app.py`
    - `model.onnx`
    - `requirements.txt`
3.  **Done!** Your app will be live at `https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME`.

---

## 🎨 Customizing the Model

To use your own trained weights:
1.  Place your `.pth` file in the root.
2.  Update `export_onnx.py` to load the `state_dict`.
3.  Re-run `python export_onnx.py`.

---

## 📱 Features Included
- **Zero-config deploy:** Standardized `vercel.json` and `requirements.txt`.
- **Premium UI:** Soft theme with Outfit font.
- **Social Sharing:** Integrated Twitter and Discord buttons.
- **Optimized:** ONNX Runtime for <2s inference on CPU.
