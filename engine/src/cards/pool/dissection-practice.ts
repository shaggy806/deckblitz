import { defineCard } from "../define.js";

// EDHREC rank 16855. Three instances of "target" (rule 115.3): the two
// creature slots are each optional and may name the same creature.

export default defineCard({
  name: "Dissection Practice",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target opponent loses 1 life and you gain 1 life.\nUp to one target creature gets +1/+1 until end of turn.\nUp to one target creature gets -1/-1 until end of turn.",
  targets: ["opponent", { kind: "optional", of: "creature" }, { kind: "optional", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 1, target: 0 },
      { kind: "gain-life", amount: 1 },
      { kind: "modify-pt", target: 1, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "modify-pt", target: 2, power: -1, toughness: -1, duration: "end-of-turn" },
    ],
  },
});
