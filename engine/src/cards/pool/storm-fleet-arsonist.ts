import { defineCard } from "../define.js";

export default defineCard({
  name: "Storm Fleet Arsonist",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 4,
  toughness: 4,
  text: "Raid — When this creature enters, if you attacked this turn, target opponent sacrifices a permanent of their choice.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "sacrifice", who: "target", filter: {}, count: 1 },
      resolve: null,
      text: "Raid — When this creature enters, if you attacked this turn, target opponent sacrifices a permanent of their choice.",
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
    },
  ],
});
