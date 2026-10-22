import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACKS =
  "Whenever this creature attacks, you may pay {E}{E}. If you do, create a 1/1 colorless Servo artifact creature token.";

export default defineCard({
  name: "Aether Chaser",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${ENTERS}\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTERS,
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
      text: ATTACKS,
    },
  ],
});
