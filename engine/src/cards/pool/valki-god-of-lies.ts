import { defineCard } from "../define.js";

// Kaldheim (KHM). A modal DFC; the back face is Tibalt, Cosmic Impostor.
//
// Each opponent reveals their hand and Valki's controller exiles a creature
// card from each until Valki leaves (rule 610.3); one gone before this
// resolves still has them reveal, but exiles nothing (the ruling). The copy
// is chosen as the ability resolves (the ruling), from the cards exiled with
// this Valki with mana value X; with none, nothing happens. A copy of a card
// has its printed values only (rule 707.2), so Valki loses this ability.
const ENTER_TEXT =
  "When Valki enters, each opponent reveals their hand. For each opponent, exile a creature card they revealed this way until Valki leaves the battlefield.";
const COPY_TEXT = "{X}: Choose a creature card exiled with Valki with mana value X. Valki becomes a copy of that card.";

export default defineCard({
  name: "Valki, God of Lies",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "reveal-hand", who: "each-opponent" },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "discard-chosen",
              target: "that-player",
              lookOnly: true,
              filter: { type: "creature" },
              destination: "exile",
              untilSourceLeaves: true,
            },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature", manaValue: { op: "eq", n: { amount: "x" } } },
        destination: "stay",
        leftover: "stay",
        then: { kind: "become-copy", target: "source", of: 0, ofCard: true },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  faces: ["Valki, God of Lies", "Tibalt, Cosmic Impostor"],
});
