import { defineCard } from "../define.js";

export default defineCard({
  name: "Entropic Decay",
  art: "https://cards.scryfall.io/art_crop/back/0/c/0c2b6960-ff4c-4557-ba6d-d504f87d4516.jpg",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Mill four cards. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: { kind: "mill", target: "you", amount: 4 },
  faces: ["Gray Slaad", "Entropic Decay"],
  adventure: true,
});
