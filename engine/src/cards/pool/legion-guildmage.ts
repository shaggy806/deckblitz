import { defineCard } from "../define.js";

// EDHREC rank 24436.

export default defineCard({
  name: "Legion Guildmage",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{5}{R}, {T}: This creature deals 3 damage to each opponent.\n{2}{W}, {T}: Tap another target creature.",
  activated: [
    {
      cost: { mana: "{5}{R}", tap: true },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "each-opponent" },
      resolve: null,
      text: "{5}{R}, {T}: This creature deals 3 damage to each opponent.",
    },
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{2}{W}, {T}: Tap another target creature.",
    },
  ],
});
