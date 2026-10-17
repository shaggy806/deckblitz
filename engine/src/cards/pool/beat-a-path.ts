import { defineCard } from "../define.js";

// Bellowing Bruiser's Adventure. Daring Discovery's "up to N target
// creatures can't block this turn", two of them: with one target illegal the
// other still can't block (its ruling).

export default defineCard({
  name: "Beat a Path",
  art: "https://cards.scryfall.io/art_crop/back/2/6/26ece013-f3ef-4c12-9dea-b2789f61f8a0.jpg",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Up to two target creatures can't block this turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
    ],
  },
  faces: ["Bellowing Bruiser", "Beat a Path"],
  adventure: true,
});
