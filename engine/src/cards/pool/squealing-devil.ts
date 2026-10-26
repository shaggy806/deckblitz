import { defineCard } from "../define.js";

// EDHREC rank 30521.
//
// X is chosen and paid as the first trigger resolves (the ruling), and the
// target creature is chosen as it goes on the stack. The second trigger reads
// the mana spent on the Devil's own spell — {X} paid for the first trigger
// doesn't count (the ruling) — and one that entered without being cast is
// sacrificed.

const PUMP_TEXT = "When this creature enters, you may pay {X}. If you do, target creature gets +X/+0 until end of turn.";
const SAC_TEXT = "When this creature enters, sacrifice it unless {B} was spent to cast it.";

export default defineCard({
  name: "Squealing Devil",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 2,
  toughness: 1,
  keywords: ["fear"],
  text: `Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n${PUMP_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Pay {X} to give the target creature +X/+0 until end of turn?",
        cost: "{X}",
        effect: { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "source", filter: { manaSpentOfColors: { B: 1 } } } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
