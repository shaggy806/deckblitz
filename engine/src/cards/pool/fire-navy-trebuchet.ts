import { defineCard } from "../define.js";

// EDHREC rank 10995.
//
// Rulings:
//   [2025-10-02] Fire Navy Trebuchet's controller chooses which player, planeswalker, or battle
//     the token is attacking. It doesn't need to be the same player, planeswalker, or battle as
//     other creatures are attacking.
//
// The token attacks whatever its controller chooses (rule 508.4, the ruling —
// `attacking: "choose"`); "sacrifice that token" is a real delayed triggered
// ability over the token just made (rule 603.7 — Urabrask's Forge's shape).

const ATTACK_TEXT =
  "Whenever you attack, create a 2/1 colorless Construct artifact creature token with flying named Ballistic Boulder that's tapped and attacking. Sacrifice that token at the beginning of the next end step.";

export default defineCard({
  name: "Fire Navy Trebuchet",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender", "reach"],
  text: `Defender, reach\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "create-token",
            token: "Ballistic Boulder Token",
            count: 1,
            tapped: true,
            attacking: "choose",
          },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "created",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice that token at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
