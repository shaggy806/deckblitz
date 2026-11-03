import { defineCard } from "../define.js";

// Rulings:
//   [2023-11-10] For Starving Revenant's enters-the-battlefield ability, you put cards into your
//     graveyard for surveil (if any) before drawing cards. If there are eight or more permanent cards
//     in your graveyard by the time you draw cards, those draws will cause the descend 8 ability to
//     trigger.
//   [2023-11-10] Except in some unusual cases, the cards you put on top of your library while
//     surveilling will be the cards you draw.
const SURVEIL_TEXT =
  "When this creature enters, surveil 2. Then for each card you put on top of your library, you draw a card and you lose 3 life.";
const DESCEND_TEXT =
  "Descend 8 — Whenever you draw a card, if there are eight or more permanent cards in your graveyard, target opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Starving Revenant",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit", "Horror"],
  power: 4,
  toughness: 4,
  text: `${SURVEIL_TEXT}\n${DESCEND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "surveil",
        amount: 2,
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { keptOnTopThisWay: true } },
            { kind: "lose-life", amount: { product: [{ keptOnTopThisWay: true }, 3] } },
          ],
        },
      },
      resolve: null,
      text: SURVEIL_TEXT,
    },
    {
      trigger: { on: "draws", who: "you" },
      condition: {
        kind: "cards-in-graveyard",
        atLeast: 8,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
      },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DESCEND_TEXT,
    },
  ],
});
