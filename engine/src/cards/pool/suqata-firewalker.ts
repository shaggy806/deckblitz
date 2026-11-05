import { defineCard } from "../define.js";

// EDHREC rank 20708.

export default defineCard({
  name: "Suq'Ata Firewalker",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 1,
  text: "This creature can't be the target of red spells or abilities from red sources.\n{T}: This creature deals 1 damage to any target.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{T}: This creature deals 1 damage to any target.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { colors: ["R"], anyController: true, notHexproof: true },
      text: "This creature can't be the target of red spells or abilities from red sources.",
    },
  ],
});
