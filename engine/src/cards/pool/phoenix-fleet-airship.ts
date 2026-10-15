import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 9238. "If you sacrificed a permanent this turn" is an
// intervening if (rule 603.4): the turn's sacrifice history, asked as the
// step begins and again as the trigger resolves (Elanor Gardner's shape).
// The token copies the Airship's copiable values — as it last existed if it
// has left by then (the rulings) — so it has every ability too. With eight
// or more permanents named Phoenix Fleet Airship (itself among them), it's a
// creature without being crewed.
const END_TEXT =
  "At the beginning of your end step, if you sacrificed a permanent this turn, create a token that's a copy of this Vehicle.";
const FLEET_TEXT =
  "As long as you control eight or more permanents named Phoenix Fleet Airship, this Vehicle is an artifact creature.";

export default defineCard({
  name: "Phoenix Fleet Airship",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${END_TEXT}\n${FLEET_TEXT}\nCrew 1`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "sacrificed", who: "you" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [crew(1)],
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { name: "Phoenix Fleet Airship" },
        atLeast: 8,
        countsSelf: true,
      },
      addTypes: ["creature"],
      text: FLEET_TEXT,
    },
  ],
});
