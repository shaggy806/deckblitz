import { defineCard } from "../define.js";

// Once per source per damage event to you (the rulings: double strike and a
// spliced Glacial Ray each trigger again). "That player" is the source's
// controller — a spell's as it last existed on the stack.
const TEXT =
  "Whenever a source an opponent controls deals damage to you, that player sacrifices a permanent of their choice.";

export default defineCard({
  name: "Michiko Konda, Truth Seeker",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "opponent", to: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-controller", filter: {}, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
