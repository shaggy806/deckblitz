import { defineCard } from "../define.js";

// EDHREC rank 25925.

export default defineCard({
  name: "Symmetry Sage",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nMagecraft — Whenever you cast or copy an instant or sorcery spell, target creature you control has base power 2 until end of turn.",
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: ["creature-you-control"],
      effect: {
        kind: "animate",
        target: 0,
        power: 2,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Magecraft — Whenever you cast or copy an instant or sorcery spell, target creature you control has base power 2 until end of turn.",
    },
  ],
});
