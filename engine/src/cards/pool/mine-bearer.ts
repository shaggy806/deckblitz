import { defineCard } from "../define.js";

export default defineCard({
  name: "Mine Bearer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{T}, Sacrifice this creature: Destroy target attacking creature.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}, Sacrifice this creature: Destroy target attacking creature.",
    },
  ],
});
