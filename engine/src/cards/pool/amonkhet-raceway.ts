import { defineCard } from "../define.js";
import { addManaAbility, maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 2338.
const HASTE_TEXT = "{T}: Target creature gains haste until end of turn.";

export default defineCard({
  name: "Amonkhet Raceway",
  types: ["land"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n{T}: Add {C}.\nMax speed — ${HASTE_TEXT}`,
  activated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
  static: [
    maxSpeed({
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
          resolve: null,
          text: HASTE_TEXT,
        },
      ],
      text: `Max speed — ${HASTE_TEXT}`,
    }),
  ],
});
