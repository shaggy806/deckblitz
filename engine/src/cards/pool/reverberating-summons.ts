import { defineCard } from "../define.js";

// EDHREC rank 24198.
//
// "If you've cast two or more spells this turn" is an intervening-if (rule
// 603.4): checked as each combat begins and again as it resolves.

const COMBAT_TEXT =
  "At the beginning of each combat, if you've cast two or more spells this turn, this enchantment becomes a 3/3 Monk creature with haste in addition to its other types until end of turn.";
const DRAW_TEXT = "{1}{R}, Discard your hand, Sacrifice this enchantment: Draw two cards.";

export default defineCard({
  name: "Reverberating Summons",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${COMBAT_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      condition: { kind: "cast-this-turn", who: "you", atLeast: 2 },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Monk"],
        keywords: ["haste"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, discardHand: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
