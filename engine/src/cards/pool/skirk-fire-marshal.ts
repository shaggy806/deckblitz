import { defineCard } from "../define.js";

export default defineCard({
  name: "Skirk Fire Marshal",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: "Protection from red\nTap five untapped Goblins you control: This creature deals 10 damage to each creature and each player.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 5, filter: { subtype: "Goblin", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 10 },
          { kind: "damage", amount: 10, who: "each-player" },
        ],
      },
      resolve: null,
      text: "Tap five untapped Goblins you control: This creature deals 10 damage to each creature and each player.",
    },
  ],
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
