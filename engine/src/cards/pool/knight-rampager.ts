import { defineCard } from "../define.js";

const RAMPAGE =
  "Frenzied Rampage — At the beginning of combat on your turn, choose an opponent at random. This creature attacks that player this combat if able.";
const DIES = "When this creature dies, it deals 4 damage to target opponent chosen at random.";

export default defineCard({
  name: "Knight Rampager",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Knight"],
  power: 6,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${RAMPAGE}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "attack-random-opponent", target: "source" },
      resolve: null,
      text: RAMPAGE,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      targetsAtRandom: true,
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: DIES,
    },
  ],
});
