import { defineCard } from "../define.js";

export default defineCard({
  name: "Intrepid Hero",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{T}: Destroy target creature with power 4 or greater.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{T}: Destroy target creature with power 4 or greater.",
    },
  ],
});
