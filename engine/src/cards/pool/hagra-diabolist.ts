import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 16439.
//
// The Allies are counted as the ability resolves (the ruling).
const TEXT =
  "Whenever this creature or another Ally you control enters, you may have target player lose life equal to the number of Allies you control.";

export default defineCard({
  name: "Hagra Diabolist",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman", "Ally"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Have target player lose life equal to the number of Allies you control?",
        effect: { kind: "lose-life", target: 0, amount: { countOf: { subtype: "Ally", controlledBy: "you" } } },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
