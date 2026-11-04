import { defineCard } from "../define.js";

// Rulings:
//   The card is imprinted face down. This means that other players don't know what the card is and
//     you can't look at the card once it's imprinted (until it's turned face up, of course).
//   Any "When this creature is turned face up" abilities that the exiled card may have don't trigger
//     because the card isn't being turned face up while it's on the battlefield.
//   If the card is not a creature card when it's turned face up, it remains exiled face up.

const IMPRINT_TEXT = "Imprint — When this creature enters, you may exile a card from your hand face down.";
const DIES_TEXT = "When this creature dies, turn the exiled card face up. If it's a creature card, put it onto the battlefield under your control.";

export default defineCard({
  name: "Summoner's Egg",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Egg"],
  power: 0,
  toughness: 4,
  text: `${IMPRINT_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: IMPRINT_TEXT,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "exile-face-down",
        leftover: "stay",
        faceDownLooks: "nobody",
      },
    },
    {
      trigger: { on: "dies", who: "self" },
      resolve: null,
      text: DIES_TEXT,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "turn-exiled-face-up" },
          { kind: "return-exiled-by-source", linked: "battlefield", under: "you", filter: { type: "creature" } },
        ],
      },
    },
  ],
});
