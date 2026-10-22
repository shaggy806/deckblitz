import { defineCard } from "../define.js";

// Aether Revolt. "You may pay {E}{E}. If you do" is a `may` with `costEnergy`.
const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {E}{E}. If you do, create a 1/1 colorless Servo artifact creature token.";

export default defineCard({
  name: "Aether Inspector",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to create a 1/1 Servo token?",
        costEnergy: 2,
        effect: { kind: "create-token", token: "Servo Token", count: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
