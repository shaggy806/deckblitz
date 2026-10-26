import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Tempest (TMP). EDHREC rank 25063. Cinder Marsh's shape: "doesn't untap
// during your next untap step" rides on the mana ability's `also` (rule
// 605.1a), so the ability stays off the stack.

const COLOR_TEXT = "{T}: Add {W} or {U}. This land doesn't untap during your next untap step.";

export default defineCard({
  name: "Thalakos Lowlands",
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
        mana: { oneOf: ["W", "U"] },
        amount: 1,
        also: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true },
      },
      resolve: null,
      text: COLOR_TEXT,
    },
  ],
});
