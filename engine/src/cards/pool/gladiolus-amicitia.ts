import { defineCard } from "../define.js";

// EDHREC rank 7044.
//
// Rulings:
//   [2025-07-25] A landfall ability triggers whenever a land you control enters for any reason. It
//     triggers whenever you play a land, as well as whenever a spell or ability puts a land onto
//     the battlefield under your control.
//   [2025-07-25] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.

const ENTER_TEXT =
  "When Gladiolus Amicitia enters, search your library for a land card, put it onto the battlefield tapped, then shuffle.";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, another target creature you control gets +2/+2 and gains trample until end of turn.";

export default defineCard({
  name: "Gladiolus Amicitia",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 6,
  toughness: 6,
  text: `${ENTER_TEXT}\n${LANDFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
