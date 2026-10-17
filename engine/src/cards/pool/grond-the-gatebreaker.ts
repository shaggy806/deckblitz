import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// EDHREC rank 15839.
//
// "Is an artifact creature": it's an artifact already, so the static adds the
// creature type (Phoenix Fleet Airship's shape) while both halves of the
// condition hold.

const CREATURE_TEXT = "As long as it's your turn and you control an Army, Grond is an artifact creature.";

export default defineCard({
  name: "Grond, the Gatebreaker",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${CREATURE_TEXT}\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(3)],
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "controls", filter: { subtype: "Army" }, atLeast: 1 }],
      },
      addTypes: ["creature"],
      text: CREATURE_TEXT,
    },
  ],
});
