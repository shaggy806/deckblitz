import { defineCard } from "../define.js";
import type { CardType } from "../define.js";

// Kaldheim. EDHREC rank 11122. A modal DFC; the back face is Hakka,
// Whispering Raven.
//
// The bonus is one static ability counting two things, written as two
// statics with one text (Multani, Yavimaya's Avatar's shape): only on the
// battlefield, so Alrund is 1/1 everywhere else (the ruling). A foretold card
// is one face down in exile (rule 702.143c-d).
//
// The card type is chosen as the trigger resolves, before the cards are
// revealed. Any card type may be chosen (the ruling): the nine that can be in
// a library each a mode, and one for the rest (conspiracy, dungeon,
// phenomenon, plane, scheme, vanguard), which no revealed card can be, so
// both go to the bottom. The cards of the chosen type go to the hand and the
// rest to the bottom in any order.
const PT_TEXT = "Alrund gets +1/+1 for each card in your hand and each foretold card you own in exile.";
const END_TEXT =
  "At the beginning of your end step, choose a card type, then reveal the top two cards of your library. Put all cards of the chosen type revealed this way into your hand and the rest on the bottom of your library in any order.";

const CARD_TYPES: readonly CardType[] = [
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "instant",
  "kindred",
  "land",
  "planeswalker",
  "sorcery",
];

const label = (type: CardType): string => type.charAt(0).toUpperCase() + type.slice(1);

export default defineCard({
  name: "Alrund, God of the Cosmos",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 1,
  toughness: 1,
  text: `${PT_TEXT}\n${END_TEXT}`,
  faces: ["Alrund, God of the Cosmos", "Hakka, Whispering Raven"],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { cardsInHand: true, pt: [1, 1] },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: { exiled: { ownedBy: "you", foretold: true }, pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          ...CARD_TYPES.map((type) => ({
            text: label(type),
            effect: {
              kind: "look-and-choose" as const,
              zone: "library" as const,
              count: 2,
              reveal: true,
              min: 2,
              max: 2,
              filter: { type },
              destination: "hand" as const,
              leftover: "bottom-any-order" as const,
            },
          })),
          {
            text: "Another card type (conspiracy, dungeon, phenomenon, plane, scheme or vanguard)",
            effect: {
              kind: "look-and-choose" as const,
              zone: "library" as const,
              count: 2,
              reveal: true,
              min: 0,
              max: 0,
              destination: "hand" as const,
              leftover: "bottom-any-order" as const,
            },
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
