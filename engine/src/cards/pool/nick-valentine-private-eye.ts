import { defineCard } from "../define.js";
import { investigate, thisOrAnother } from "../helpers.js";

// EDHREC rank 11067. Fallout.
//
// Rulings:
//   [2024-03-08] Once Nick Valentine has been blocked, making the blocking creature stop being an
//     artifact won't cause Nick Valentine to become unblocked.
//
// The evasion is a blocking restriction checked as blocks are declared
// (`cantBeBlockedBy` a non-artifact), so a later change doesn't unblock him.
// "Nick Valentine or another artifact creature you control dies" is the two
// triggers `thisOrAnother` writes; the investigate is optional.
const EVASION_TEXT = "Nick Valentine can't be blocked except by artifact creatures.";
const DIES_TEXT =
  "Whenever Nick Valentine or another artifact creature you control dies, you may investigate. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Nick Valentine, Private Eye",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Synth", "Detective"],
  power: 2,
  toughness: 2,
  text: `${EVASION_TEXT}\n${DIES_TEXT}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { notTypes: ["artifact"] }, text: EVASION_TEXT }],
  triggered: [
    ...thisOrAnother({
      trigger: { on: "dies", who: "you-control", filter: { types: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "may", prompt: "Investigate?", effect: investigate() },
      resolve: null,
      text: "Whenever Nick Valentine or another artifact creature you control dies, you may investigate.",
    }),
  ],
});
