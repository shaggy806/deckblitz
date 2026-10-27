import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 26084.

const CYCLE_TEXT = "When you cycle this card, you may have target creature get +1/+1 until end of turn.";

export default defineCard({
  name: "Primal Boost",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{2}{G}" },
  text: `Target creature gets +4/+4 until end of turn.\nCycling {2}{G} ({2}{G}, Discard this card: Draw a card.)\n${CYCLE_TEXT}`,
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get +1/+1 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
