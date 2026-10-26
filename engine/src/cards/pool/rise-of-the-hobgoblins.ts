import { defineCard } from "../define.js";

// EDHREC rank 19572.
//
// Rulings:
//   [2008-08-01] When the "enters" ability resolves, you choose the value of X, pay for it, and
//     put the tokens onto the battlefield. You can activate mana abilities to pay for {X}, but no
//     one can cast spells or activate abilities in response to this choice.

export default defineCard({
  name: "Rise of the Hobgoblins",
  manaCost: "{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  text: "When this enchantment enters, you may pay {X}. If you do, create X 1/1 red and white Goblin Soldier creature tokens.\n{R/W}: Red creatures and white creatures you control gain first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{R/W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["R"] }, { colors: ["W"] }] },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R/W}: Red creatures and white creatures you control gain first strike until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to create X 1/1 red and white Goblin Soldier creature tokens?",
        cost: "{X}",
        effect: { kind: "create-token", token: "Goblin Soldier Token", count: "x" },
      },
      resolve: null,
      text: "When this enchantment enters, you may pay {X}. If you do, create X 1/1 red and white Goblin Soldier creature tokens.",
    },
  ],
});
