import { defineCard } from "../define.js";

export default defineCard({
  name: "Deadly Vanity",
  art: "https://cards.scryfall.io/art_crop/back/8/9/8982ff88-8595-4363-8cde-6e87fb57a2d8.jpg",
  manaCost: "{5}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose a creature or planeswalker, then destroy all other creatures and planeswalkers.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        who: "you",
        for: { permanent: { typesAnyOf: ["creature", "planeswalker"] }, keep: true },
      },
      {
        kind: "destroy-all",
        filter: { typesAnyOf: ["creature", "planeswalker"], notThisWay: "chosen" },
      },
    ],
  },
  faces: ["Selfless Glyphweaver", "Deadly Vanity"],
});
