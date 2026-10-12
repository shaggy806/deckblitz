import { defineCard } from "../define.js";
import type { CardFilter } from "../../filter.js";

// Which it becomes is read off the target as the ability resolves: saddled
// if it's a Mount (rule 702.171b — saddled by no creature, 702.171c), an
// artifact creature if it's a Vehicle (with its printed power and
// toughness, 301.7b), both if it's both.
const ANTHEM_TEXT = "Creatures you control get +0/+1 and have vigilance.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, choose up to one target Mount or Vehicle you control. Until end of turn, that permanent becomes saddled if it's a Mount and becomes an artifact creature if it's a Vehicle.";
const MOUNT: CardFilter = { subtype: "Mount" };
const VEHICLE: CardFilter = { subtype: "Vehicle" };

export default defineCard({
  name: "Alacrian Armory",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${ANTHEM_TEXT}\n${COMBAT_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [0, 1],
      grantKeywords: ["vigilance"],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtypes: ["Mount", "Vehicle"] } } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: MOUNT },
            then: { kind: "become-saddled", target: 0 },
          },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: VEHICLE },
            then: { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
