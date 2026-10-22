import { defineCard } from "../define.js";
import type { CardType } from "../define.js";

// EDHREC rank 23237. "Two cards that share a card type" is "two of the
// discarded cards have some one card type" — one `this-way` count per card
// type (the ruling lists them; legendary is a supertype, not one), and two
// counters however many types they share. The random discard is from the whole
// hand, the three drawn cards included, with nothing done in between (the
// ruling).

const TEXT =
  "When this creature enters, draw three cards, then discard two cards at random. If two cards that share a card type are discarded this way, put two +1/+1 counters on this creature.";

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

export default defineCard({
  name: "Rowdy Crew",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 2, random: true },
          {
            kind: "conditional",
            condition: {
              kind: "any",
              of: CARD_TYPES.map((type) => ({
                kind: "this-way" as const,
                what: "discarded" as const,
                filter: { type },
                atLeast: 2,
              })),
            },
            then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
