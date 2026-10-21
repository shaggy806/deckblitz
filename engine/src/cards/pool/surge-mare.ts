import { defineCard } from "../define.js";

const LOOT_TEXT = "Whenever this creature deals damage to an opponent, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Surge Mare",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Horse", "Fish"],
  power: 0,
  toughness: 5,
  text: `This creature can't be blocked by green creatures.\n${LOOT_TEXT}\n{1}{U}: This creature gets +2/-2 until end of turn.`,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { colors: ["G"] },
      text: "This creature can't be blocked by green creatures.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}: This creature gets +2/-2 until end of turn.",
    },
  ],
});
