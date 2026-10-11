import { defineCard } from "../define.js";

// EDHREC rank 17473.
// Makes Robot Hero → new token "Robot Hero Token".

const ANTHEM_TEXT = "Attacking creatures you control get +1/+0.";
const CAST_TEXT = "Whenever you cast a red spell, create a 2/1 colorless Robot Hero artifact creature token with flying.";

export default defineCard({
  name: "Iron Man, Tony Stark",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ANTHEM_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "create-token", token: "Robot Hero Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
