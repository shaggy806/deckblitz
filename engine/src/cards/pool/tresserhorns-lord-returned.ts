import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. The enters trigger's three things are one
// `allOf` option of an `unless`: takeable only when you can do all of them —
// three creatures to sacrifice and 3 life to pay (rules 118.3, 119.4) — and
// then done in order. "Three creatures" isn't "other": it may be one of them.
const ENTER_TEXT =
  "When Tresserhorn's Lord enters, sacrifice him unless you sacrifice three creatures, pay 3 life, and have target opponent draw three cards.";
const SACRIFICE_TEXT = "Whenever you sacrifice a creature, draw a card.";

export default defineCard({
  name: "Tresserhorn's Lord, Returned",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Noble"],
  power: 10,
  toughness: 4,
  keywords: ["trample", "indestructible"],
  text: `Trample, indestructible\n${ENTER_TEXT}\n${SACRIFICE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [
          {
            allOf: [
              { sacrifice: { type: "creature" }, count: 3, text: "Sacrifice three creatures" },
              { payLife: 3, text: "Pay 3 life" },
              { doing: { kind: "draw", amount: 3, target: 0 }, text: "Target opponent draws three cards" },
            ],
            text: "Sacrifice three creatures, pay 3 life, and have target opponent draw three cards",
          },
        ],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
