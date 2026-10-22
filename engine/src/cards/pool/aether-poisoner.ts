import { defineCard } from "../define.js";

// EDHREC rank 23401.
// Makes Servo → use "Servo Token".
//
// Rulings:
//   [2024-06-07] Some triggered abilities state that you "may pay" a certain amount of {E}. You
//     can't pay that amount multiple times to multiply the effect. You simply choose whether or
//     not to pay that amount of {E} as the ability resolves.

const ETB_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {E}{E}. If you do, create a 1/1 colorless Servo artifact creature token.";

export default defineCard({
  name: "Aether Poisoner",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\n${ETB_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to create a Servo?",
        costEnergy: 2,
        effect: { kind: "create-token", token: "Servo Token", count: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
