import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// EDHREC rank 23557.
//
// Cinder Marsh's shape.

const COLOR_TEXT = "{T}: Add {B} or {R}. This land doesn't untap during your next untap step.";

export default defineCard({
  name: "Lantern-Lit Graveyard",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${COLOR_TEXT}`,
  activated: [
    addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["B", "R"] },
        amount: 1,
        also: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true },
      },
      resolve: null,
      text: COLOR_TEXT,
    },
  ],
});
