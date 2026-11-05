import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When Gyruda enters, each player mills four cards. Put a creature card with an even mana value from among the milled cards onto the battlefield under your control.";

export default defineCard({
  name: "Gyruda, Doom of Depths",
  manaCost: "{4}{U/B}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Kraken"],
  power: 6,
  toughness: 6,
  text:
    "Companion — Your starting deck contains only cards with even mana values. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\n" +
    ENTER_TEXT,
  companion: { kind: "each-card", of: "card", test: { manaValueIs: "even" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyards",
            min: 1,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "creature", manaValueParity: "even", thisWay: "milled" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
