import { defineCard } from "../define.js";

const TEXT = "When this creature enters, it fights target creature an opponent controls chosen at random.";

export default defineCard({
  name: "Scab-Clan Giant",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      targetsAtRandom: true,
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
