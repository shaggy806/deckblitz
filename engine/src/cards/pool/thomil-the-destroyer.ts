import { defineCard } from "../define.js";

// Mystery Booster Commander. The 0 is a loyalty ability, not a mana ability
// (rule 605.1a): it uses the stack, and the mana is added as it resolves.
const PLUS = "+2: Create a 2/2 black Zombie creature token.";
const ZERO = "0: You may sacrifice a creature. If you do, add {B}{B}{B}.";
const MINUS =
  "−5: Create a Lord of the Pit token. (It's a {4}{B}{B}{B} 7/7 Demon creature with flying, trample, and \"At the beginning of your upkeep, sacrifice another creature. If you can't, this token deals 7 damage to you.\")";

export default defineCard({
  name: "Thomil, the Destroyer",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Thomil"],
  loyalty: 4,
  canBeCommander: true,
  text: `${PLUS}\n${ZERO}\n${MINUS}\nThomil, the Destroyer can be your commander.`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, text: "Sacrifice a creature" }],
        ifDid: { kind: "add-mana", mana: "B", amount: 3 },
      },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Lord of the Pit Token", count: 1 },
      resolve: null,
      text: MINUS,
    },
  ],
});
