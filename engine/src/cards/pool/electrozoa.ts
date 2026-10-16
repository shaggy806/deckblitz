import { defineCard } from "../define.js";

// EDHREC rank 26620. Modern Horizons 3. "Tap this creature unless you pay
// {E}" is Static Prison's `may` with `costEnergy`: declining, or having no
// energy, taps it.

const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const MAIN_TEXT = "At the beginning of your first main phase, tap this creature unless you pay {E}.";

export default defineCard({
  name: "Electrozoa",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish"],
  power: 3,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT}\n${MAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E} to keep Electrozoa untapped? (Otherwise it's tapped.)",
        costEnergy: 1,
        effect: { kind: "sequence", effects: [] },
        else: { kind: "tap", target: "source" },
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
});
