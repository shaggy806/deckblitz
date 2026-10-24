import { defineCard } from "../define.js";

// EDHREC rank 27598.

export default defineCard({
  name: "Dromoka's Gift",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Bolster 4. (Choose a creature with the least toughness among creatures you control and put four +1/+1 counters on it.)",
  effect: { kind: "bolster", amount: 4 },
});
