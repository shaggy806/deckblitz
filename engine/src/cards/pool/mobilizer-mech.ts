import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

const CREWED_TEXT =
  "Whenever this Vehicle becomes crewed, up to one other target Vehicle you control becomes an artifact creature until end of turn.";

// The generic `becomes-crewed` trigger (B278): whenever its crew ability
// resolves (rule 702.122e), already a creature or not (its ruling). The other
// Vehicle becoming a creature isn't crewing it.
export default defineCard({
  name: "Mobilizer Mech",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${CREWED_TEXT}\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  triggered: [
    {
      trigger: { on: "event", event: "becomes-crewed", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Vehicle" } } },
        },
      ],
      effect: { kind: "become", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: CREWED_TEXT,
    },
  ],
  activated: [crew(3)],
});
