import { defineCard } from "../define.js";

// Urza's Rebuff's "tap up to two target creatures".

export default defineCard({
  name: "Dizzying Swoop",
  art: "https://cards.scryfall.io/art_crop/back/c/7/c7d5e394-8e41-442e-ae97-a478a61e1b9d.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Tap up to two target creatures. (Then exile this card. You may cast the creature later from exile.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
    ],
  },
  faces: ["Ardenvale Tactician", "Dizzying Swoop"],
  adventure: true,
});
