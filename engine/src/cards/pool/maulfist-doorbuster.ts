import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 26680. "If you do" (not "when you do"): the target
// is chosen as the trigger goes on the stack, and the energy is paid as it
// resolves (Confiscation Coup's `costEnergy` over a targeted effect) — none
// if the target has become illegal (the ruling). It can't block any creature
// this turn, not just this one (the ruling).
const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT = "Whenever this creature attacks, you may pay {E}. If you do, target creature can't block this turn.";

export default defineCard({
  name: "Maulfist Doorbuster",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 2,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
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
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {E} to have target creature not block this turn?",
        costEnergy: 1,
        effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
