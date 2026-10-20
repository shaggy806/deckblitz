import { defineCard } from "../define.js";

// EDHREC rank 16346.
//
// The creature is targeted as the trigger goes on the stack; the d20 is
// rolled as it resolves (the ruling).
const CONE_TEXT =
  "Cone of Cold — When this creature enters, choose target creature an opponent controls, then roll a d20.\n1—9 | Tap that creature.\n10—20 | Tap that creature. It doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Scion of Stygia",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Tiefling", "Shaman"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${CONE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "tap", target: 0 } },
          { min: 10, max: 20, effect: { kind: "tap", target: 0, doesntUntapNext: true } },
        ],
      },
      resolve: null,
      text: CONE_TEXT,
    },
  ],
});
