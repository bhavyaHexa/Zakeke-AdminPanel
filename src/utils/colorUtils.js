// Utility functions for handling color logic in the admin panel

export const createNewColorSwatch = () => {
  return {
    id: Date.now().toString(),
    name: "",
    hex: "#ffffff",
  };
};

export const removeColorSwatchFromList = (colorList, colorId) => {
  return colorList.filter((c) => c.id !== colorId);
};

export const updateColorSwatchInList = (colorList, colorId, field, value) => {
  const color = colorList.find((c) => c.id === colorId);
  if (color) {
    color[field] = value;
  }
};
