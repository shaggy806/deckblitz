import { defineCard } from "../define.js";

// EDHREC rank 13629.
//
// Sami, Ship's Engineer's intervening-if (rule 603.4): checked as the end step
// starts and again as it resolves (the ruling).

const END_TEXT =
  "At the beginning of your end step, if you control two or more tapped creatures, put a +1/+1 counter on each creature you control other than this creature.";

export default defineCard({
  name: "Dawnstrike Vanguard",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 5,
  keywords: ["lifelink"],
  text: `Lifelink\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", tapped: true }, atLeast: 2 },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
