import { defineCard } from "../define.js";

// EDHREC rank 14047.
// Makes Ballistic Boulder → use "Ballistic Boulder Token".
//
// Rulings:
//   [2023-06-16] Mordor Trebuchet's controller chooses which player, planeswalker, or battle the
//     token is attacking. It doesn't need to be the same player, planeswalker, or battle that any
//     of the Goblins and/or Orcs are attacking.

const TEXT =
  "Whenever you attack with one or more Goblins and/or Orcs, create a 2/1 colorless Construct artifact creature token with flying named Ballistic Boulder that's tapped and attacking. Sacrifice that token at end of combat.";

export default defineCard({
  name: "Mordor Trebuchet",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 1,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { subtypes: ["Goblin", "Orc"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Ballistic Boulder Token", count: 1, tapped: true, attacking: "choose" },
          {
            kind: "delayed-trigger",
            at: "end-of-combat",
            about: "created",
            effect: { kind: "for-each-target", from: 0, effect: { kind: "sacrifice-target", target: 0 } },
            text: "Sacrifice that token at end of combat.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
