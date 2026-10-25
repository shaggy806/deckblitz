import { defineCard } from "../define.js";

// EDHREC rank 26764. Fate Reforged.

export default defineCard({
  name: "Honor's Reward",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "You gain 4 life. Bolster 2. (Choose a creature with the least toughness among creatures you control and put two +1/+1 counters on it.)",
  effect: {
    kind: "sequence",
    effects: [{ kind: "gain-life", amount: 4 }, { kind: "bolster", amount: 2 }],
  },
});
