import { defineCard } from "../define.js";

const TEXT =
  'Whenever this creature is dealt 3 or more damage, investigate. (Create a Clue token. It\'s an artifact with "{2}, Sacrifice this token: Draw a card.")';

export default defineCard({
  name: "Innocent Bystander",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Citizen"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self", atLeast: 3 },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", investigate: true, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
