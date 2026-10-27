import { defineCard } from "../define.js";

// EDHREC rank 16748.
//
// Rulings:
//   You can cycle this card even if there are no legal targets for the triggered ability.
//   The cycling ability and the triggered ability are separate.

const CYCLE_TEXT = "When you cycle this card, you may have target creature gain fear until end of turn.";

export default defineCard({
  name: "Dirge of Dread",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  cycling: { cost: "{1}{B}" },
  text: `All creatures gain fear until end of turn. (They can't be blocked except by artifact creatures and/or black creatures.)\nCycling {1}{B} ({1}{B}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  effect: { kind: "grant-keyword-all", filter: { type: "creature" }, keyword: "fear", duration: "end-of-turn" },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature gain fear until end of turn?",
        effect: { kind: "grant-keyword", target: 0, keyword: "fear", duration: "end-of-turn" },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
