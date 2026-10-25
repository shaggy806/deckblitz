import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 7642.
//
// The Allies are counted as the ability resolves (the ruling).
const TEXT =
  "Whenever this creature or another Ally you control enters, you may gain life equal to the number of Allies you control.";

export default defineCard({
  name: "Ondu Cleric",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric", "Ally"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Gain life equal to the number of Allies you control?",
        effect: { kind: "gain-life", amount: { countOf: { subtype: "Ally", controlledBy: "you" } } },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
