import { defineCard } from "../define.js";

const TEXT =
  "{T}, Sacrifice this artifact: Put X +0/+1 counters on target creature, where X is that creature's mana value.";

export default defineCard({
  name: "Living Armor",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+0/+1", amount: { manaValueOf: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
