import { defineCard } from "../define.js";

// EDHREC rank 17189. March of the Machine.
//
// Rulings:
//   [2023-04-14] The target Incubator token transforms before its +1/+1 counters are doubled, so
//     anything that cares about +1/+1 counters being placed on a creature will see them being
//     placed on the Phyrexian artifact creature.

const ENTERS_TEXT = "When this creature enters, incubate 2.";
const ACTIVATED_TEXT = "{5}: Transform target Incubator token you control. Double the number of +1/+1 counters on it.";

export default defineCard({
  name: "Elvish Vatkeeper",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf"],
  power: 3,
  toughness: 3,
  text: `${ENTERS_TEXT} (Create an Incubator token with two +1/+1 counters on it and "{2}: Transform this token." It transforms into a 0/0 Phyrexian artifact creature.)\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Incubator", token: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "transform", target: 0 },
          { kind: "double-counters", target: 0, counter: "+1/+1" },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "incubate", amount: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
