import { defineCard } from "../define.js";

export default defineCard({
  name: "Super-Skrull",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skrull", "Shapeshifter", "Villain"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\n{2}{W}: Create a 0/4 colorless Wall creature token with defender.\n{3}{G}: Super-Skrull gets +4/+4 until end of turn.\n{4}{R}: Super-Skrull deals 4 damage to target creature.\n{5}{U}: Target player draws four cards.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Wall Token (The Fantastic Four)", count: 1 },
      resolve: null,
      text: "{2}{W}: Create a 0/4 colorless Wall creature token with defender.",
    },
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 4, toughness: 4, duration: "end-of-turn" },
      resolve: null,
      text: "{3}{G}: Super-Skrull gets +4/+4 until end of turn.",
    },
    {
      cost: { mana: "{4}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "{4}{R}: Super-Skrull deals 4 damage to target creature.",
    },
    {
      cost: { mana: "{5}{U}", tap: false },
      targets: ["player"],
      effect: { kind: "draw", amount: 4, target: 0 },
      resolve: null,
      text: "{5}{U}: Target player draws four cards.",
    },
  ],
});
