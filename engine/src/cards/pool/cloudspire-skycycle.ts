import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 17630.
//
// The Earth Crystal's distribution: one target takes both counters, two take
// one each (rule 601.2d — each target of a division gets at least one), the
// split fixed as the trigger goes on the stack. Both slots are "other" than
// this Vehicle, and the second other than the first.

const TEXT =
  "When this Vehicle enters, distribute two +1/+1 counters among one or two other target Vehicles and/or creatures you control.";

const OTHER_YOURS: TargetSpec = {
  kind: "other",
  than: "source",
  of: { kind: "permanent", whose: "you", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
};

export default defineCard({
  name: "Cloudspire Skycycle",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}\nCrew 1`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [OTHER_YOURS, { kind: "optional", of: { kind: "other", of: OTHER_YOURS, than: { slot: 0 } } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target-chosen", index: 1 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          ],
        },
        else: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
