import { defineCard } from "../define.js";

export default defineCard({
  name: "Banishing Coils",
  art: "https://cards.scryfall.io/art_crop/back/1/8/18da890e-0f8d-41e9-a29f-24cb5393c464.jpg",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Exile target artifact or enchantment. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["artifact-or-enchantment"],
  effect: { kind: "exile", target: 0 },
  faces: ["Guardian Naga", "Banishing Coils"],
  adventure: true,
});
