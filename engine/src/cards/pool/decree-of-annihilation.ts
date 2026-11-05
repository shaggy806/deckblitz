import { defineCard } from "../define.js";

// EDHREC rank 12119. One instruction: everything is exiled at once. The cycle
// trigger resolves before cycling's draw (the rulings).
const CYCLE_TEXT = "When you cycle this card, destroy all lands.";

export default defineCard({
  name: "Decree of Annihilation",
  manaCost: "{8}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Exile all artifacts, creatures, and lands from the battlefield, all cards from all graveyards, and all cards from all hands.\nCycling {5}{R}{R} ({5}{R}{R}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "exile-all", filter: { typesAnyOf: ["artifact", "creature", "land"] } },
      { kind: "exile-graveyard", target: "each-player", fromHand: "also" },
    ],
  },
  cycling: { cost: "{5}{R}{R}" },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "land" } },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
