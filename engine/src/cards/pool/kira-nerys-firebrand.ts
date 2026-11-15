import { defineCard } from "../define.js";

// EDHREC rank 25525.

const ENTER_TEXT =
  "If a creature you control would enter while you control an attacking creature, instead it enters tapped and attacking.";
const PUMP_TEXT = "Whenever another creature you control enters, it gets +1/+1 until end of turn.";

// The replacement (rule 614.1c) reads "while you control an attacking
// creature" as the creature would enter; entering attacking, its controller
// chooses what it attacks (rule 508.4), and it was never declared as an
// attacker (508.3a). Kira's own entry isn't changed by her ability (614.12).
export default defineCard({
  name: "Kira Nerys, Firebrand",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bajoran", "Soldier"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 1 },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        tapped: true,
        attacking: true,
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
