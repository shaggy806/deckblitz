import { defineCard } from "../define.js";

// "Is black": its colour becomes black (layer 5), no longer red, while
// threshold holds; the destroy ability exists only then too.

const DESTROY_TEXT = "{2}{B}, {T}: Destroy target red creature.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1, is black, and has "${DESTROY_TEXT}"`;

export default defineCard({
  name: "Possessed Barbarian",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian", "Horror"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      setColors: ["B"],
      grantsActivated: [
        {
          cost: { mana: "{2}{B}", tap: true },
          targets: [{ kind: "permanent", filter: { type: "creature", colors: ["R"] } }],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: DESTROY_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
