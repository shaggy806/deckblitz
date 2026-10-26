import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 25978.
//
// Rulings:
//   [2005-06-01] This ability triggers once for each creature blocked by or blocking Shape
//     Stealer. If multiple creatures block it, Shape Stealer's power and toughness will change for
//     each one in succession. The first trigger put on the stack will be the last to resolve, so
//     that will set Shape Stealer's final power and toughness.
//   [2005-06-01] Once the ability resolves, changing the other creature's power or toughness
//     doesn't affect Shape Stealer.
//   [2005-06-01] The other creature's power and toughness are determined as the triggered
//     ability resolves.
//   [2005-06-01] If Shape Stealer's new toughness is less than any damage on Shape Stealer, Shape
//     Stealer will be destroyed as a state-based action once the triggered ability resolves.
//
// One ability over two events: "blocks a creature" (the blocked creature is the trigger
// object) and "becomes blocked by a creature" (once per blocker, the blocker the trigger
// object). The other creature's P/T is read as the ability resolves, as it last existed if it
// has left, and set as base P/T (layer 7b) until end of turn — Eldrazi Mimic's shape.
const TEXT =
  "Whenever this creature blocks or becomes blocked by a creature, this creature's base power and toughness become equal to that creature's power and toughness until end of turn.";
const BECOME = {
  kind: "animate",
  target: "source",
  power: { powerOf: "trigger-object" },
  toughness: { toughnessOf: "trigger-object" },
  addTypes: [],
  addSubtypes: [],
  duration: "end-of-turn",
} as const;

export default defineCard({
  name: "Shape Stealer",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter", "Spirit"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: BECOME,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "blocked-by", who: "self" },
      targets: [],
      effect: BECOME,
      resolve: null,
      text: TEXT,
    },
  ],
});
