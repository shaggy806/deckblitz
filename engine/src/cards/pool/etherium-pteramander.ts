import { defineCard } from "../define.js";

// EDHREC rank 15722.

export default defineCard({
  name: "Etherium Pteramander",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Salamander", "Drake"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature can block only creatures with flying.\n{6}{B}: Adapt 4. This ability costs {1} less to activate for each other artifact you control. (If this creature has no +1/+1 counters on it, put four +1/+1 counters on it.)",
  activated: [
    {
      cost: { mana: "{6}{B}", tap: false },
      targets: [],
      effect: { kind: "adapt", amount: 4 },
      resolve: null,
      text: "{6}{B}: Adapt 4. This ability costs {1} less to activate for each other artifact you control.",
      costReduction: {
        reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" }, excludeSelf: true },
      },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "cant-block", attackers: { not: { keyword: "flying" } } }],
      text: "This creature can block only creatures with flying.",
    },
  ],
});
