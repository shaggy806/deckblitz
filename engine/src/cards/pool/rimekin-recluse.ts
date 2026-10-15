import { defineCard } from "../define.js";

// EDHREC rank 19097.
//
// Matterbending Mage's enters trigger.

const ENTER_TEXT = "When this creature enters, return up to one other target creature to its owner's hand.";

export default defineCard({
  name: "Rimekin Recluse",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental", "Wizard"],
  power: 3,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
