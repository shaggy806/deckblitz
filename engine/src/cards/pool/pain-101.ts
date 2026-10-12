import { defineCard } from "../define.js";

// EDHREC rank 11256.
//
// Rulings:
//   [2026-01-27] If the target creature is a token, the granted ability will still trigger when it
//     dies, but you won't return the token to the battlefield.

const RETURN_TEXT =
  "When this creature dies, return it to the battlefield tapped under its owner's control.";

// Feign Death's granted trigger, beside deathtouch.
export default defineCard({
  name: "Pain 101",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Until end of turn, target creature gains deathtouch and "${RETURN_TEXT}"`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
          resolve: null,
          text: RETURN_TEXT,
        },
      },
    ],
  },
});
