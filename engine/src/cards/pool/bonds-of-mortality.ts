import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] The last ability causes creatures your opponents control to lose hexproof and
//     indestructible as it resolves. Effects that cause those creatures to gain those abilities
//     after that point will work normally.

const ENTER_TEXT = "When this enchantment enters, draw a card.";
const LOSE_TEXT = "{G}: Creatures your opponents control lose hexproof and indestructible until end of turn.";

export default defineCard({
  name: "Bonds of Mortality",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${LOSE_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: {
        kind: "lose-keywords",
        filter: { type: "creature", controlledBy: "opponent" },
        keywords: ["hexproof", "indestructible"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
