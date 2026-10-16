import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 9517.
//
// Rulings:
//   [2023-11-10] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2023-11-10] If a double-faced card is exiled this way, it will return with its front face up,
//     no matter which face was up when it left the battlefield.
//   [2023-11-10] If Dusk Rose Reliquary leaves the battlefield before its last ability resolves,
//     the target permanent won't be exiled.
//
// Costly Plunder's additional cost, the `ward` helper, and Detention
// Chariot's exile with its linked return (rule 610.3).
const ENTER_TEXT =
  "When this artifact enters, exile target artifact or creature an opponent controls until this artifact leaves the battlefield.";

export default defineCard({
  name: "Dusk Rose Reliquary",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `As an additional cost to cast this spell, sacrifice an artifact or creature.\nWard {2}\n${ENTER_TEXT}`,
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // The exile's linked return (rule 610.3).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this artifact leaves the battlefield, return the exiled card.",
    },
  ],
});
