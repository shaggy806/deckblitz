import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 14225.
export default defineCard({
  name: "Fearless Liberator",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Berserker"],
  power: 2,
  toughness: 1,
  text: "Boast — {2}{R}: Create a 2/1 red Dwarf Berserker creature token. (Activate only if this creature attacked this turn and only once each turn.)",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Dwarf Berserker Token", count: 1 },
      resolve: null,
      text: "Boast — {2}{R}: Create a 2/1 red Dwarf Berserker creature token.",
      boast: true,
    },
  ],
});
