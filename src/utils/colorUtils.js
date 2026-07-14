// Utility functions for handling color/texture/roughness/metalness logic in the admin panel

// ── Color helpers ──────────────────────────────────────────────────────────────

export const createNewColorSwatch = () => ({
  id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  hex: "#ffffff",
});

export const removeColorSwatchFromList = (colorList, colorId) =>
  colorList.filter((c) => c.id !== colorId);

export const updateColorSwatchInList = (colorList, colorId, field, value) => {
  const color = colorList.find((c) => c.id === colorId);
  if (color) color[field] = value;
};

// ── Texture helpers ────────────────────────────────────────────────────────────

export const createNewTextureSwatch = () => ({
  id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  url: "",
});

export const removeTextureSwatchFromList = (textureList, textureId) =>
  textureList.filter((t) => t.id !== textureId);

export const updateTextureSwatchInList = (textureList, textureId, field, value) => {
  const texture = textureList.find((t) => t.id === textureId);
  if (texture) texture[field] = value;
};

// ── Roughness helpers ──────────────────────────────────────────────────────────

export const createNewRoughnessValue = () => ({
  id: `r_val_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  value: 0.5,
});

export const createNewRoughnessTexture = () => ({
  id: `r_tex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  url: "",
});

// ── Metalness helpers ──────────────────────────────────────────────────────────

export const createNewMetalnessValue = () => ({
  id: `m_val_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  value: 0.5,
});

export const createNewMetalnessTexture = () => ({
  id: `m_tex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  url: "",
});
