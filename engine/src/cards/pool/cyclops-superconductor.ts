import { defineCard } from "../define.js";

// EDHREC rank 17332.
//
// Evereth, Viceroy of Plunder's death trigger, paid in energy: the {E}{E}{E}
// is a `may`'s `costEnergy`, and the damage is a reflexive ability (rule
// 603.12) whose target is chosen once it's paid (the ruling). Its power is
// the Cyclops's as it last existed on the battlefield (the ruling).
const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const ENERGY_TEXT = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const DIES_TEXT =
  "When this creature dies, you may pay {E}{E}{E}. When you do, this creature deals damage equal to its power to any target.";

export default defineCard({
  name: "Cyclops Superconductor",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Cyclops", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${PROWESS_TEXT}\n${ENERGY_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ENERGY_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E}{E} to have this creature deal damage equal to its power to any target?",
        costEnergy: 3,
        effect: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          text: "When you do, this creature deals damage equal to its power to any target.",
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
