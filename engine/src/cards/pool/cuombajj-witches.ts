import { defineCard } from "../define.js";

// EDHREC rank 16370.
//
// You name the opponent, who chooses the second target as it's activated
// (rules 602.2b, 601.2c). You still control the ability, so a hexproof creature
// that opponent controls can't be chosen (the ruling). Each "any target" is its
// own instance of the word, so both may be the same.
const TEXT = "{T}: This creature deals 1 damage to any target and 1 damage to any target of an opponent's choice.";

export default defineCard({
  name: "Cuombajj Witches",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target", "any-target"],
      opponentChoosesTargets: [1],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "damage", amount: 1, target: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
