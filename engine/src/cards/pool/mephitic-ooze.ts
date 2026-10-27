import { defineCard } from "../define.js";

// EDHREC rank 25115.

const PT_TEXT = "This creature gets +1/+0 for each artifact you control.";
const DESTROY_TEXT =
  "Whenever this creature deals combat damage to a creature, destroy that creature. The creature can't be regenerated.";

export default defineCard({
  name: "Mephitic Ooze",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 0,
  toughness: 5,
  text: `${PT_TEXT}\n${DESTROY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient", cantBeRegenerated: true },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
