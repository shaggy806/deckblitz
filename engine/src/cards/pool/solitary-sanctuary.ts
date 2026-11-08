import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this enchantment enters, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";
const TAP_TEXT = "Whenever you tap an untapped creature an opponent controls, put a +1/+1 counter on target creature you control.";

// `becomes-tapped`'s `by` (B278): only your spell's or ability's tapping
// (its ruling — not an opponent tapping their own creature for your
// Tangle Wire).
export default defineCard({
  name: "Solitary Sanctuary",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTERS_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "becomes-tapped", who: "opponent", filter: { type: "creature" }, by: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
