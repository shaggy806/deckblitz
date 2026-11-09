import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

const CREWED_TEXT =
  "Whenever this Vehicle becomes crewed for the first time each turn, until end of turn, this Vehicle becomes a copy of target nonlegendary creature that crewed it this turn, except it's 4/3, it's a Vehicle artifact in addition to its other types, and it has flying.";

// The 4/3 applies only if what's copied is a creature (rule 707.9f, its
// ruling): a noncreature crew makes it a 0/0 once the crew effect is applied.
// EDHREC rank 11889.
export default defineCard({
  name: "Mindlink Mech",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${CREWED_TEXT}\nCrew 1`,
  triggered: [
    {
      trigger: { on: "event", event: "becomes-crewed", who: "self", firstTimeEachTurn: true },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", notSupertype: "legendary", crewedSource: true } }],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        until: "end-of-turn",
        exceptions: {
          addTypes: ["artifact"],
          addSubtypes: ["Vehicle"],
          keywords: ["flying"],
          ifCopied: [{ ofType: "creature", patch: { power: 4, toughness: 3 } }],
        },
      },
      resolve: null,
      text: CREWED_TEXT,
    },
  ],
  activated: [crew(1)],
});
