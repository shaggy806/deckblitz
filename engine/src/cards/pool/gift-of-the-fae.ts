import { defineCard } from "../define.js";

export default defineCard({
  name: "Gift of the Fae",
  art: "https://cards.scryfall.io/art_crop/back/e/8/e8bbece8-9620-44d9-b991-350fe952538a.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Target creature gets +2/+1 and gains flying until end of turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
    ],
  },
  faces: ["Faerie Guidemother", "Gift of the Fae"],
  adventure: true,
});
