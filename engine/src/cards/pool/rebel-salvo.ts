import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 11810.

export default defineCard({
  name: "Rebel Salvo",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Affinity for Equipment (This spell costs {1} less to cast for each Equipment you control.)\nRebel Salvo deals 5 damage to target creature or planeswalker. That permanent loses indestructible until end of turn.",
  selfCostReduction: affinity({ subtype: "Equipment" }),
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "lose-keywords", target: 0, keywords: ["indestructible"], duration: "end-of-turn" },
    ],
  },
});
