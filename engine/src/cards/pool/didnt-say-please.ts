import { defineCard } from "../define.js";

// EDHREC rank 3519. `mill` with a slot holding a
// spell mills its controller — read after the counter too, and for a spell
// that can't be countered (the ruling: it still mills).

export default defineCard({
  name: "Didn't Say Please",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. Its controller mills three cards.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "mill", target: 0, amount: 3 },
    ],
  },
});
