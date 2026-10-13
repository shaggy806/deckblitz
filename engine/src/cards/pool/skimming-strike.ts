import { defineCard } from "../define.js";

export default defineCard({
  name: "Skimming Strike",
  art: "https://cards.scryfall.io/art_crop/back/b/1/b1d21a9a-6b0c-4fbc-a427-81be885d326b.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Omen"],
  text: "Tap up to one target creature. Draw a card. (Then shuffle this card into its owner's library.)",
  targets: [{ kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
  faces: ["Dirgur Island Dragon", "Skimming Strike"],
  omen: true,
});
