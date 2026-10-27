import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Champions of Kamigawa (CHK). EDHREC rank 24167. Cinder Marsh's shape: the
// "doesn't untap" rider is part of the mana ability (rule 605.1a).

const COLOR_TEXT = "{T}: Add {U} or {B}. This land doesn't untap during your next untap step.";

export default defineCard({
  name: "Waterveil Cavern",
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
        mana: { oneOf: ["U", "B"] },
        amount: 1,
        also: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true },
      },
      resolve: null,
      text: COLOR_TEXT,
    },
  ],
});
