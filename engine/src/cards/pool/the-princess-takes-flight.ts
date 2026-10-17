import { defineCard } from "../define.js";

// EDHREC rank 12687.
//
// Rulings:
//   [2023-09-01] If The Princess Takes Flight's first chapter ability exiled more than one
//     creature (usually because the ability was copied), its third chapter ability will return
//     all of the exiled cards to the battlefield under their owners' control.
//
// Chapter I exiles linked to this Saga's stint (rule 607.2a — `linked`), and
// chapter III returns every card so linked that's still in exile, together.
// A token exiled ceases to exist (rule 111.7) and doesn't come back.

const I_TEXT = "I — Exile up to one target creature.";
const II_TEXT = "II — Target creature you control gets +2/+2 and gains flying until end of turn.";
const III_TEXT = "III — Return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "The Princess Takes Flight",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield" },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
