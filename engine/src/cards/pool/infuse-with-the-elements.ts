import { defineCard } from "../define.js";

// EDHREC rank 27658.
const TEXT =
  "Converge — Put X +1/+1 counters on target creature, where X is the number of colors of mana spent to cast this spell. That creature gains trample until end of turn.";

export default defineCard({
  name: "Infuse with the Elements",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: { colorsSpentOf: "source" } },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
