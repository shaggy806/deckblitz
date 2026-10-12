import { defineCard } from "../define.js";

export default defineCard({
  name: "Vagrant Plowbeasts",
  manaCost: "{5}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 6,
  text: "{1}: Regenerate target creature with power 5 or greater.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 5 } } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{1}: Regenerate target creature with power 5 or greater.",
    },
  ],
});
