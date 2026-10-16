import { defineCard } from "../define.js";

// EDHREC rank 18574.

export default defineCard({
  name: "Raucous Entertainer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Bard"],
  power: 2,
  toughness: 2,
  text: "{1}, {T}: Put a +1/+1 counter on each creature you control that entered this turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", enteredThisTurn: true },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "{1}, {T}: Put a +1/+1 counter on each creature you control that entered this turn.",
    },
  ],
});
