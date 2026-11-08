import { firebending } from "../helpers.js";
import { defineCard } from "../define.js";

const FIREBENDING_TEXT = "Firebending 2";
const BEND_TEXT =
  "Whenever you waterbend, earthbend, firebend, or airbend, draw a card. Then if you've done all four this turn, transform Avatar Aang.";

// Transforms into Aang, Master of Elements. The generic `bends` trigger and
// the journal's `bent` entries (B278): "Then if you've done all four this
// turn" reads the whole turn, before Aang arrived too (its ruling), as the
// ability resolves — part of the effect, not an intervening "if".
export default defineCard({
  name: "Avatar Aang",
  manaCost: "{R}{G}{W}{U}",
  colors: ["G", "R", "U", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Avatar", "Ally"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying, firebending 2\n${BEND_TEXT}`,
  triggered: [
    firebending(2, FIREBENDING_TEXT),
    {
      trigger: { on: "event", event: "bends", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "turn-history", what: "waterbent" },
                { kind: "turn-history", what: "earthbent" },
                { kind: "turn-history", what: "firebent" },
                { kind: "turn-history", what: "airbent" },
              ],
            },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: BEND_TEXT,
    },
  ],
  faces: ["Avatar Aang", "Aang, Master of Elements"],
  transform: true,
});
