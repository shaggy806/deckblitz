import { defineCard } from "../define.js";

const CHAPTER_I = "I — Draw two cards, then discard two cards.";
const CHAPTER_II = "II — Return up to one target artifact, instant, or sorcery card from your graveyard to your hand.";
const CHAPTER_III =
  "III — Choose up to two target cards in graveyards. The owners of those cards shuffle them into their libraries.";

export default defineCard({
  name: "Those Old Scientists",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "instant", "sorcery"] } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2 }],
      effect: { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "shuffle" },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
