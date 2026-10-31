import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// "Target creature that crewed it this turn" (rule 702.122c): one tapped to
// pay its crew cost this turn, still the same object — `crewedSource`, read
// against the Schooner as the target is chosen.
const ATTACK_TEXT =
  "Whenever this Vehicle attacks, target creature that crewed it this turn explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on that creature, then put the card back or put it into your graveyard.)";

export default defineCard({
  name: "Subterranean Schooner",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 4,
  text: `${ATTACK_TEXT}\nCrew 1`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", crewedSource: true } }],
      effect: { kind: "explore", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [crew(1, crewText(1))],
});
