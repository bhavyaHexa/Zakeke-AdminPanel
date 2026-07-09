// Utility functions for handling color/texture logic in the admin panel

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
