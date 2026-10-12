import { defineCard } from "../define.js";

export default defineCard({
  name: "Trench Wurm",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 3,
  toughness: 3,
  text: "{2}{R}, {T}: Destroy target nonbasic land.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}{R}, {T}: Destroy target nonbasic land.",
    },
  ],
});
