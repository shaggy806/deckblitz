import { defineCard } from "../define.js";
import { addManaAbility, maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 1406. Start your engines! (rule 702.179) and a max speed
// mana ability (702.178a): the land has "{T}: Add {C}{C}" only while its
// controller's speed is 4.
const MAX_TEXT = "Max speed — {T}: Add {C}{C}.";

export default defineCard({
  name: "Muraganda Raceway",
  types: ["land"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n{T}: Add {C}.\n${MAX_TEXT}`,
  activated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
  static: [
    maxSpeed({
      grantsActivated: [addManaAbility({ mana: "C", amount: 2, text: "{T}: Add {C}{C}." })],
      text: MAX_TEXT,
    }),
  ],
});
