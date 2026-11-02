import { defineCard } from "../define.js";

const KHANS_TEXT = "Khans — At the beginning of combat on your turn, put two +1/+1 counters on target creature you control.";
const DRAGONS_TEXT = "Dragons — At the beginning of combat on each opponent's turn, tap target creature that player controls.";

export default defineCard({
  name: "Citadel Siege",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose Khans or Dragons.\n• ${KHANS_TEXT}\n• ${DRAGONS_TEXT}`,
  chooseOnEnter: ["Khans", "Dragons"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "chosen-on-enter", value: "Khans" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: KHANS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "opponent" },
      condition: { kind: "chosen-on-enter", value: "Dragons" },
      targets: [{ kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: DRAGONS_TEXT,
    },
  ],
});
