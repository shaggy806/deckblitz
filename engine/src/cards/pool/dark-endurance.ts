import { defineCard } from "../define.js";

// EDHREC rank 14731. Ajani's Response's targeted reduction, on a blocker.

export default defineCard({
  name: "Dark Endurance",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "This spell costs {1} less to cast if it targets a blocking creature.\nTarget creature gets +2/+0 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", blocking: true }, reduceGeneric: 1 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});
