import { defineCard } from "../define.js";

// Estrid, the Masked's Mask token.

export default defineCard({
  name: "Mask Token",
  art: "b21b5504-c5ef-4dfc-8219-8db90aca7694",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: "Enchant permanent\nUmbra armor (If enchanted permanent would be destroyed, instead remove all damage from it and destroy this Aura.)",
  targets: ["permanent"],
});
