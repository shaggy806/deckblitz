import { defineCard } from "../define.js";

export default defineCard({
  name: "Desert",
  colors: [],
  types: ["land"],
  subtypes: ["Desert"],
  text: "{T}: Add {C}.\n{T}: This land deals 1 damage to target attacking creature. Activate only during the end of combat step.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      condition: { kind: "turn-structure", steps: ["end-combat"] },
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This land deals 1 damage to target attacking creature. Activate only during the end of combat step.",
    },
  ],
});
