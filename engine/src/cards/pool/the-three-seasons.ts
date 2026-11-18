import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// EDHREC rank 16970.
//
// Chapter III chooses without targeting: three cards in each graveyard, all
// of a smaller one, picked by you graveyard by graveyard (`for-each-player`
// of a `look-and-choose` `from: "that-player"`, `destination: "stay"`), and
// only then are they shuffled away together (`put-on-libraries` of `{
// inGraveyards: { thisWay: "chosen" } }`): a player with no cards in their
// graveyard doesn't shuffle (the ruling).

const CHAPTER_I = "I — Mill three cards.";
const CHAPTER_II = "II — Return up to two target snow permanent cards from your graveyard to your hand.";
const CHAPTER_III =
  "III — Choose three cards in each graveyard. Their owners shuffle those cards into their libraries.";

// A snow permanent card: any card but an instant or a sorcery.
const SNOW_PERMANENT: CardFilter = { supertype: "snow", notTypes: ["instant", "sorcery"] };

export default defineCard({
  name: "The Three Seasons",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [
        { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: SNOW_PERMANENT } },
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "card-in-graveyard", whose: "you", filter: SNOW_PERMANENT }, than: { slots: [0] } },
        },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-player",
            who: "each-player",
            effect: {
              kind: "look-and-choose",
              zone: "graveyard",
              from: "that-player",
              min: 3,
              max: 3,
              destination: "stay",
              leftover: "stay",
              prompt: "Choose three cards to shuffle into their owner's library",
            },
          },
          { kind: "put-on-libraries", what: { inGraveyards: { thisWay: "chosen" } }, position: "shuffle" },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
