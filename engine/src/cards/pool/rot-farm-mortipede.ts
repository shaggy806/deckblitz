import { defineCard } from "../define.js";

// EDHREC rank 22186.
//
// Rulings:
//   [2024-02-02] If multiple creature cards leave your graveyard at the same time, Rot Farm
//     Mortipede's ability will trigger only once.
//
// `leaves-graveyard` is batched — once per move however many cards left
// (Cyan, Vengeful Samurai's "one or more creature cards").

const TEXT =
  "Whenever one or more creature cards leave your graveyard, this creature gets +1/+0 and gains menace and lifelink until end of turn.";

export default defineCard({
  name: "Rot Farm Mortipede",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
