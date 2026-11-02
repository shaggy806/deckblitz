import { defineCard } from "../define.js";

export default defineCard({
  name: "Baki's Curse",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Baki's Curse deals 2 damage to each creature for each Aura attached to that creature.",
  targets: [],
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature" },
    simultaneous: true,
    effect: { kind: "damage", amount: { countOf: { subtype: "Aura", attachedToTarget: 0 }, times: 2 }, target: 0 },
  },
});
