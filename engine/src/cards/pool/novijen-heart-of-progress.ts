import { defineCard } from "../define.js";

export default defineCard({
  name: "Novijen, Heart of Progress",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{G}{U}, {T}: Put a +1/+1 counter on each creature that entered this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{G}{U}", tap: true },
      targets: [],
      // Each one, whoever controls it (the ruling).
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", enteredThisTurn: true },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "{G}{U}, {T}: Put a +1/+1 counter on each creature that entered this turn.",
    },
  ],
});
