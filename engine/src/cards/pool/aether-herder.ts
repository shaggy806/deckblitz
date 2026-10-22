import { defineCard } from "../define.js";

// EDHREC rank 25507.

const ENTER = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK =
  "Whenever this creature attacks, you may pay {E}{E}. If you do, create a 1/1 colorless Servo artifact creature token.";

export default defineCard({
  name: "Aether Herder",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer", "Druid"],
  power: 3,
  toughness: 3,
  text: `${ENTER}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER,
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
      text: ATTACK,
    },
  ],
});
