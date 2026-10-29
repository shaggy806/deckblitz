import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 4390.
//
// Fabricate 1 (rule 702.123a): the choice is made as it resolves, and with the
// creature gone there is no counter to put — a Servo is made instead. The
// granted copy is the same ability on each other nontoken creature you
// control, so the creature that enters is the one it's about. The modal
// ability's mode is chosen as it's activated (rule 700.2b).

const FABRICATE: TriggeredAbility = {
  trigger: { on: "enters-battlefield", who: "self" },
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "source-on-battlefield" },
    then: {
      kind: "modal",
      minModes: 1,
      maxModes: 1,
      modes: [
        {
          text: "Put a +1/+1 counter on this creature.",
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        },
        {
          text: "Create a 1/1 colorless Servo artifact creature token.",
          effect: { kind: "create-token", token: "Servo Token", count: 1 },
        },
      ],
    },
    else: { kind: "create-token", token: "Servo Token", count: 1 },
  },
  resolve: null,
  text: "Fabricate 1",
};

export default defineCard({
  name: "Cayth, Famed Mechanist",
  manaCost: "{1}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 3,
  toughness: 3,
  text: "Fabricate 1 (When this creature enters, put a +1/+1 counter on it or create a 1/1 colorless Servo artifact creature token.)\nOther nontoken creatures you control have fabricate 1.\n{2}, {T}: Choose one —\n• Populate.\n• Proliferate.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Populate.", effect: { kind: "populate" } },
          { text: "Proliferate.", effect: { kind: "proliferate" } },
        ],
      },
      resolve: null,
      text: "{2}, {T}: Choose one —\n• Populate.\n• Proliferate.",
    },
  ],
  triggered: [FABRICATE],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", token: false },
        excludeSelf: true,
      },
      grantsTriggered: [FABRICATE],
      text: "Other nontoken creatures you control have fabricate 1.",
    },
  ],
});
