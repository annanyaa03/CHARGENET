import torch
import torch.nn as nn
import torch.onnx
import os

class CharacterDecoder(nn.Module):
    def __init__(self, latent_dim=64):
        super(CharacterDecoder, self).__init__()
        self.fc = nn.Linear(latent_dim, 256 * 4 * 4)
        
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1), # 8x8
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1), # 16x16
            nn.BatchNorm2d(64),
            nn.ReLU(True),
            nn.ConvTranspose2d(64, 32, kernel_size=4, stride=2, padding=1),  # 32x32
            nn.BatchNorm2d(32),
            nn.ReLU(True),
            nn.ConvTranspose2d(32, 3, kernel_size=4, stride=2, padding=1),   # 64x64
            nn.Tanh() # Output range [-1, 1]
        )

    def forward(self, z):
        x = self.fc(z)
        x = x.view(-1, 256, 4, 4)
        x = self.decoder(x)
        return x

def export_model():
    latent_dim = 64
    model = CharacterDecoder(latent_dim=latent_dim)
    model.eval()

    # Generate dummy weights if needed (already initialized randomly by torch)
    print("Model initialized with dummy weights.")

    # Create dummy input for ONNX export
    dummy_input = torch.randn(1, latent_dim)

    # Export to ONNX
    onnx_path = "model.onnx"
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    print(f"Model exported to {onnx_path}")

if __name__ == "__main__":
    export_model()
