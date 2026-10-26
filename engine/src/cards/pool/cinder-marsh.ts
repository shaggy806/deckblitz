import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Tempest (TMP). EDHREC rank 24379. "This land doesn't untap during your
// next untap step" is part of the mana ability (rule 605.1a), so it rides on
// the add-mana's `also` (The Great Henge's shape) and the ability stays off
// the stack. The land is already tapped by the cost: `onlyDoesntUntap` just
// marks it (`skipsNextUntap`, read at its controller's next untap step —
// exert's "your next untap step" reads the same mark).

const COLOR_TEXT = "{T}: Add {B} or {R}. This land doesn't untap during your next untap step.";

export default defineCard({
  name: "Cinder Marsh",
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
