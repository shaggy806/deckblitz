import { defineCard } from "../define.js";

// Rulings:
//   Each opponent chooses a creature or planeswalker in turn order, then all
//     are sacrificed at once; then each discards. You still return a card and
//     draw even if no opponent sacrificed or discarded anything.
//   The card returned isn't targeted: it's chosen as the spell resolves.
//   With two or more in your graveyard, each one's trigger exiles itself and
//     adds its own loyalty counter.
//
// The second ability works only from the graveyard (rule 113.6k — it exiles
// its own card from there). The extra loyalty counter isn't gated on the
// exile ("exile this card … That planeswalker enters with …", no "if you
// do"), so the spell is marked even when the card has already left.
const SPELL =
  "Each opponent sacrifices a creature or planeswalker of their choice, then discards a card. You return a creature or planeswalker card from your graveyard to your hand, then draw a card.";
const BOLAS =
  "When you cast a Bolas planeswalker spell, exile this card from your graveyard. That planeswalker enters with an additional loyalty counter on it.";

export default defineCard({
  name: "Dark Intimations",
  manaCost: "{2}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["sorcery"],
  text: `${SPELL}\n${BOLAS}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sacrifice",
        who: "each-opponent",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
        count: 1,
      },
      { kind: "discard", target: "each-opponent", amount: 1 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { typesAnyOf: ["creature", "planeswalker"] },
      },
      { kind: "draw", amount: 1 },
    ],
  },
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", filter: { type: "planeswalker", subtype: "Bolas" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "source" },
          { kind: "enters-with-counters", target: "trigger-object", counter: "loyalty", amount: 1 },
        ],
      },
      resolve: null,
      text: BOLAS,
    },
  ],
});
