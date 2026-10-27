import { defineCard } from "../define.js";

// Scourge (SCG). EDHREC rank 16217.
//
// The cycle trigger goes on the stack above the cycling ability, so it resolves before the draw;
// cycling is allowed with no creature to target (the rulings).
const CYCLE_TEXT = "When you cycle this card, you may put four +1/+1 counters on target creature.";

export default defineCard({
  name: "Decree of Savagery",
  manaCost: "{7}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{4}{G}{G}" },
  text: `Put four +1/+1 counters on each creature you control.\nCycling {4}{G}{G} ({4}{G}{G}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  effect: {
    kind: "add-counter-all",
    filter: { type: "creature", controlledBy: "you" },
    counter: "+1/+1",
    amount: 4,
  },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put four +1/+1 counters on target creature?",
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
