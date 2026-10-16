import { defineCard } from "../define.js";

// EDHREC rank 19175.
//
// Adeline's "for each opponent, create a token that's tapped and attacking
// that player", without the planeswalker option: each Boar attacks that
// opponent itself. The tokens all enter at the same time (the ruling), so the
// `for-each-player` runs inside a `simultaneous` sequence — one entry, which a
// "whenever one or more tokens enter" sees once. They were never declared as
// attackers, so nothing that triggers on attacking sees them.

const ATTACK_TEXT =
  "Whenever this creature attacks, for each opponent, you create a 2/2 green Boar creature token that's tapped and attacking that opponent.";

export default defineCard({
  name: "Stampede Surfer",
  manaCost: "{3}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "create-token",
              token: "Boar Token",
              count: 1,
              tapped: true,
              attacking: { player: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
