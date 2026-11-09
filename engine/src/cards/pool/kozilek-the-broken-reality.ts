import { defineCard } from "../define.js";

// EDHREC rank 2466. Each targeted player manifests two cards of their choice
// from their own hand (`player: "that-player"`, one card if that's all they
// have); "for each card manifested this way" counts the cards that entered.

const CAST_TEXT =
  "When you cast this spell, up to two target players each manifest two cards from their hands. For each card manifested this way, you draw a card. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";
const STATIC_TEXT = "Other colorless creatures you control get +3/+2.";

const MANIFEST_TWO = {
  kind: "look-and-choose",
  player: "that-player",
  zone: "hand",
  min: 2,
  max: 2,
  destination: "manifest",
  leftover: "stay",
  prompt: "Manifest two cards from your hand",
} as const;

export default defineCard({
  name: "Kozilek, the Broken Reality",
  manaCost: "{9}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 9,
  toughness: 9,
  text: `${CAST_TEXT}\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colorless: true, controlledBy: "you" }, excludeSelf: true },
      grantPt: [3, 2],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [
        { kind: "optional", of: "player" },
        { kind: "optional", of: { kind: "other", of: "player", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-player", who: { target: 0 }, effect: MANIFEST_TWO },
          { kind: "for-each-player", who: { target: 1 }, effect: MANIFEST_TWO },
          { kind: "draw", amount: { thisWay: "put-onto-battlefield", who: "each-player" } },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
