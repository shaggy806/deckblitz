import { defineCard } from "../define.js";

// EDHREC rank 9607. Mirrodin.
//
// Rulings:
//   [2004-12-01] If you cast an entwined Journey of Discovery using Vedalken Orrery during an
//     opponent's turn, you can't play two lands during that turn.
//
// The extra land drops are this turn's only (rule 305.2), so on an opponent's
// turn they let you play nothing, as the ruling says.

export default defineCard({
  name: "Journey of Discovery",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  kicker: { cost: "{2}{G}", keyword: "entwine" },
  text: "Choose one —\n• Search your library for up to two basic land cards, reveal them, put them into your hand, then shuffle.\n• You may play up to two additional lands this turn.\nEntwine {2}{G} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Search your library for up to two basic land cards, reveal them, put them into your hand, then shuffle.",
        targets: [],
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "hand",
          reveal: true,
          min: 0,
          max: 2,
        },
      },
      {
        text: "You may play up to two additional lands this turn.",
        targets: [],
        effect: { kind: "additional-land-drop", amount: 2 },
      },
    ],
    kickedModes: 2,
  },
});
