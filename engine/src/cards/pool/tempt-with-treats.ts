import { defineCard } from "../define.js";

export default defineCard({
  name: "Tempt with Treats",
  art: "https://cards.scryfall.io/art_crop/back/5/c/5cb01d4d-91c2-41c6-981e-b4135a1e1e36.jpg",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Create a Food token. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: { kind: "create-token", token: "Food Token", count: 1 },
  faces: ["Gumdrop Poisoner", "Tempt with Treats"],
  adventure: true,
});
