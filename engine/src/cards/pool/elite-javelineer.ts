import { defineCard } from "../define.js";

export default defineCard({
  name: "Elite Javelineer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature blocks, it deals 1 damage to target attacking creature.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "Whenever this creature blocks, it deals 1 damage to target attacking creature.",
    },
  ],
});
