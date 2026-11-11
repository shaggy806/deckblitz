import { defineCard } from "../define.js";

const DOUBLE_TEXT =
  "If a source you control with an odd mana value would deal damage to a permanent or player, it deals double that damage to that permanent or player instead.";

export default defineCard({
  name: "Obosh, the Preypiercer",
  manaCost: "{3}{B/R}{B/R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Hellion", "Horror"],
  power: 3,
  toughness: 5,
  text:
    "Companion — Your starting deck contains only cards with odd mana values and land cards. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\n" +
    DOUBLE_TEXT,
  companion: { kind: "each-card", of: "nonland", test: { manaValueIs: "odd" } },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { modify: { times: 2 } },
        source: { controlledBy: "you", manaValueParity: "odd" },
      },
      text: DOUBLE_TEXT,
    },
  ],
});
