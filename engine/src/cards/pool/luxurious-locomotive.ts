import { crew } from "../helpers.js";
import { defineCard } from "../define.js";

// Outlaws of Thunder Junction (OTJ). "Each creature that crewed it this turn"
// is the journal's `"crewers"` read for this Vehicle in this stint
// (`selfOnly`), as it resolves: every creature tapped to pay its crew cost
// (rule 702.122b), those that have left the battlefield since included (the
// ruling), each once. Crew 1 can be activated only once each turn.
//
// Rulings:
//   You may tap more creatures than necessary to activate a crew ability.
//   Luxurious Locomotive's triggered ability counts each creature that crewed it this turn,
//     including creatures that are no longer on the battlefield as the ability resolves.

const ATTACKS =
  "Whenever this Vehicle attacks, create a Treasure token for each creature that crewed it this turn.";
const CREW = "Crew 1. Activate only once each turn.";

export default defineCard({
  name: "Luxurious Locomotive",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 5,
  text: `${ATTACKS} (They're artifacts with "{T}, Sacrifice this token: Add one mana of any color.")\n${CREW} (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: { turnHistory: "crewers", who: "each-player", selfOnly: true },
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
  activated: [{ ...crew(1, CREW), oncePerTurn: true }],
});
