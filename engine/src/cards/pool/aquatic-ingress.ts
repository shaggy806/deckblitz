import { defineCard } from "../define.js";

export default defineCard({
  name: "Aquatic Ingress",
  art: "https://cards.scryfall.io/art_crop/back/d/0/d0f31357-3fd2-4355-acad-05d253a04b4a.jpg",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Up to two target creatures each get +1/+0 until end of turn and can't be blocked this turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "unblockable", duration: "end-of-turn" },
    ],
  },
  faces: ["Sea Hag", "Aquatic Ingress"],
  adventure: true,
});
