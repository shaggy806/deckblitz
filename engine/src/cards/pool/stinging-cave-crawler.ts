import { defineCard } from "../define.js";

// EDHREC rank 11873. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] Some descend triggered abilities include intervening "if" clauses. Each of these
//     abilities checks your graveyard at the moment it would trigger to see if it does. If it
//     does trigger, it will check again as it tries to resolve.
//
// Audacious Thief's attack trigger behind an intervening "if" (`condition`,
// checked as it triggers and again as it resolves).

const TEXT =
  "Descend 4 — Whenever this creature attacks, if there are four or more permanent cards in your graveyard, you draw a card and you lose 1 life.";

export default defineCard({
  name: "Stinging Cave Crawler",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Horror"],
  power: 1,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { notTypes: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
