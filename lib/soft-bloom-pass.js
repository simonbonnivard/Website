import { Vector2 } from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Bloom avec adoucissement diagonal.
 *
 * UnrealBloomPass ne floute qu'en horizontal puis vertical : le noyau
 * ressemble à une croix, d'où les halos carrés sur les filaments fins.
 * Deux passes diagonales supplémentaires par mip rapprochent le résultat
 * d'un flou isotrope, sans changer le reste de la chaîne.
 */
const DIAG_A = new Vector2(0.70710678, 0.70710678);
const DIAG_B = new Vector2(0.70710678, -0.70710678);

export class SoftBloomPass extends UnrealBloomPass {
  constructor(resolution, strength, radius, threshold) {
    super(resolution, strength, radius, threshold);

    this.diagBlurA = this._getSeparableBlurMaterial(5);
    this.diagBlurB = this._getSeparableBlurMaterial(5);
  }

  dispose() {
    this.diagBlurA.dispose();
    this.diagBlurB.dispose();
    super.dispose();
  }

  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    renderer.getClearColor(this._oldClearColor);
    this.oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    renderer.setClearColor(this.clearColor, 0);

    if (maskActive) renderer.state.buffers.stencil.setTest(false);

    if (this.renderToScreen) {
      this._fsQuad.material = this._basic;
      this._basic.map = readBuffer.texture;

      renderer.setRenderTarget(null);
      renderer.clear();
      this._fsQuad.render(renderer);
    }

    this.highPassUniforms.tDiffuse.value = readBuffer.texture;
    this.highPassUniforms.luminosityThreshold.value = this.threshold;
    this._fsQuad.material = this.materialHighPassFilter;

    renderer.setRenderTarget(this.renderTargetBright);
    renderer.clear();
    this._fsQuad.render(renderer);

    let inputRenderTarget = this.renderTargetBright;

    for (let i = 0; i < this.nMips; i++) {
      const invSize = this.separableBlurMaterials[i].uniforms.invSize.value;

      this._fsQuad.material = this.separableBlurMaterials[i];
      this.separableBlurMaterials[i].uniforms.colorTexture.value =
        inputRenderTarget.texture;
      this.separableBlurMaterials[i].uniforms.direction.value =
        UnrealBloomPass.BlurDirectionX;
      renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
      renderer.clear();
      this._fsQuad.render(renderer);

      this.separableBlurMaterials[i].uniforms.colorTexture.value =
        this.renderTargetsHorizontal[i].texture;
      this.separableBlurMaterials[i].uniforms.direction.value =
        UnrealBloomPass.BlurDirectionY;
      renderer.setRenderTarget(this.renderTargetsVertical[i]);
      renderer.clear();
      this._fsQuad.render(renderer);

      this.diagBlurA.uniforms.colorTexture.value =
        this.renderTargetsVertical[i].texture;
      this.diagBlurA.uniforms.invSize.value = invSize;
      this.diagBlurA.uniforms.direction.value = DIAG_A;
      this._fsQuad.material = this.diagBlurA;
      renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
      renderer.clear();
      this._fsQuad.render(renderer);

      this.diagBlurB.uniforms.colorTexture.value =
        this.renderTargetsHorizontal[i].texture;
      this.diagBlurB.uniforms.invSize.value = invSize;
      this.diagBlurB.uniforms.direction.value = DIAG_B;
      this._fsQuad.material = this.diagBlurB;
      renderer.setRenderTarget(this.renderTargetsVertical[i]);
      renderer.clear();
      this._fsQuad.render(renderer);

      inputRenderTarget = this.renderTargetsVertical[i];
    }

    this._fsQuad.material = this.compositeMaterial;
    this.compositeMaterial.uniforms.bloomStrength.value = this.strength;
    this.compositeMaterial.uniforms.bloomRadius.value = this.radius;
    this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;

    renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
    renderer.clear();
    this._fsQuad.render(renderer);

    this._fsQuad.material = this.blendMaterial;
    this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture;

    if (maskActive) renderer.state.buffers.stencil.setTest(true);

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this._fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(readBuffer);
      this._fsQuad.render(renderer);
    }

    renderer.setClearColor(this._oldClearColor, this.oldClearAlpha);
    renderer.autoClear = oldAutoClear;
  }
}
