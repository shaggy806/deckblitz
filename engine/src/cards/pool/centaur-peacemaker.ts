import { defineCard } from "../define.js";

const TEXT = "When this creature enters, each player gains 4 life.";

export default defineCard({
  name: "Centaur Peacemaker",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Centaur", "Cleric"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 4, who: "each-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
