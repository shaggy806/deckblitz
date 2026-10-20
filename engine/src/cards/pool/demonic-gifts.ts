import { defineCard } from "../define.js";

// EDHREC rank 8570.
//
// Supernatural Stamina's shape, untapped. The returned creature is a new
// object without the granted ability, so it comes back only once (the
// ruling).
const RETURN_TEXT = "When this creature dies, return it to the battlefield under its owner's control.";

export default defineCard({
  name: "Demonic Gifts",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Until end of turn, target creature gets +2/+0 and gains "${RETURN_TEXT}"`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "put-onto-battlefield", target: "trigger-object" },
          resolve: null,
          text: RETURN_TEXT,
        },
      },
    ],
  },
});
