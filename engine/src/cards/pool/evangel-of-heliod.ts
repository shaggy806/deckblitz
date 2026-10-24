import { defineCard } from "../define.js";

export default defineCard({
  name: "Evangel of Heliod",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: "When this creature enters, create a number of 1/1 white Soldier creature tokens equal to your devotion to white. (Each {W} in the mana costs of permanents you control counts toward your devotion to white.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: { devotionTo: "W" } },
      resolve: null,
      text: "When this creature enters, create a number of 1/1 white Soldier creature tokens equal to your devotion to white.",
    },
  ],
});
