import { defineCard } from "../define.js";

// "Draw a card if …" isn't an intervening "if" (it doesn't follow the trigger
// condition, rule 603.4): the ability always triggers and the count is read
// as it resolves.
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, draw a card if you had two or more creatures enter the battlefield under your control this turn.";

export default defineCard({
  name: "Park Heights Pegasus",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-history", what: "entered", filter: { type: "creature" }, atLeast: 2 },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
