import { defineCard } from "../define.js";

export default defineCard({
  name: "Syndicate Guildmage",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{1}{W}, {T}: Tap target creature with power 4 or greater.\n{4}{B}, {T}: This creature deals 2 damage to target opponent or planeswalker.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}{W}, {T}: Tap target creature with power 4 or greater.",
    },
    {
      cost: { mana: "{4}{B}", tap: true },
      targets: ["opponent-or-planeswalker"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{4}{B}, {T}: This creature deals 2 damage to target opponent or planeswalker.",
    },
  ],
});
