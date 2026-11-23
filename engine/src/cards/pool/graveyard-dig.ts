import { defineCard } from "../define.js";

// "You may cast this spell for {2}{B/G}{B/G}. If you do, ignore the bracketed
// text" is cleave's own definition (rule 702.148a-b) — and, as the ruling
// says, a copy keeps the choice — so it's held as `cleave`.

const BLACK_OR_GREEN_CREATURE = { type: "creature", anyOf: [{ colors: ["B"] }, { colors: ["G"] }] } as const;

export default defineCard({
  name: "Graveyard Dig",
  manaCost: "{1}{B/G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Return up to two target [black or green] creature cards from your graveyard to your hand.\nYou may cast this spell for {2}{B/G}{B/G}. If you do, ignore the bracketed text.",
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: BLACK_OR_GREEN_CREATURE } },
    {
      kind: "optional",
      of: {
        kind: "other",
        of: { kind: "card-in-graveyard", whose: "you", filter: BLACK_OR_GREEN_CREATURE },
        than: { slots: [0] },
      },
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
  cleave: {
    cost: "{2}{B/G}{B/G}",
    targets: [
      { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
      {
        kind: "optional",
        of: {
          kind: "other",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
          than: { slots: [0] },
        },
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
  },
});
