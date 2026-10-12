import { defineCard } from "../define.js";
import { saddle } from "../helpers.js";

// Top-commanders rank 366. "A creature that saddled it this turn" (rule
// 702.171c) is `saddledSource`: one tapped for its saddle cost this turn and
// still the same object. X is the sacrificed creature's power as it last
// existed on the battlefield; putting the lands onto the battlefield isn't
// playing them (the rulings).
const DAMAGE_TEXT =
  "Whenever The Gitrog deals combat damage to a player, you may sacrifice a creature that saddled it this turn. If you do, draw X cards, then put up to X land cards from your hand onto the battlefield tapped, where X is the sacrificed creature's power.";
const X = { powerOf: "sacrificed" } as const;

export default defineCard({
  name: "The Gitrog, Ravenous Ride",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Frog", "Horror", "Mount"],
  power: 6,
  toughness: 5,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${DAMAGE_TEXT}\nSaddle 1`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { type: "creature", saddledSource: true },
            text: "Sacrifice a creature that saddled The Gitrog this turn",
          },
        ],
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: X },
            {
              kind: "look-and-choose",
              zone: "hand",
              min: 0,
              max: X,
              destination: "battlefield",
              enterTapped: true,
              leftover: "stay",
              filter: { type: "land" },
            },
          ],
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [saddle(1)],
});
