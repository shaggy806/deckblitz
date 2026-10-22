import { defineCard } from "../define.js";

// EDHREC rank 4888.
//
// Into the Fire's "that many plus one" over Chance's any-number discard; the
// counters trigger is Kotis, Sibsig Champion's batched entry, of other
// creatures (Bess, Soul Nourisher's `otherOnly`).
//
// Rulings:
//   [2025-06-06] You choose how many cards to discard as Celes's first ability resolves. You may
//     choose to discard no cards and just draw a card.

const ETB_TEXT = "When Celes enters, discard any number of cards, then draw that many cards plus one.";
const COUNTERS_TEXT =
  "Whenever one or more other creatures you control enter, if one or more of them entered from a graveyard or was cast from a graveyard, put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Celes, Rune Knight",
  manaCost: "{1}{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Knight"],
  power: 4,
  toughness: 4,
  text: `${ETB_TEXT}\n${COUNTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true },
          { kind: "draw", amount: { sum: [{ thisWay: "discarded" }, 1] } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        batched: true,
        otherOnly: true,
        filter: { type: "creature", anyOf: [{ enteredFrom: "graveyard" }, { castFrom: "graveyard" }] },
      },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
