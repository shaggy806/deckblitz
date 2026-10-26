import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 9299. Twiddle's shape, then a draw.
//
// Rulings:
//   [2010-03-01] If the targeted permanent is an illegal target by the time Twitch resolves, the
//     entire spell doesn't resolve. You don't draw a card.

export default defineCard({
  name: "Twitch",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may tap or untap target artifact, creature, or land.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
