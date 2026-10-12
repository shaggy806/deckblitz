import { defineCard } from "../define.js";

export default defineCard({
  name: "Eastern Paladin",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Knight"],
  power: 3,
  toughness: 3,
  text: "{B}{B}, {T}: Destroy target green creature.",
  activated: [
    {
      cost: { mana: "{B}{B}", tap: true },
      targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}{B}, {T}: Destroy target green creature.",
    },
  ],
});
