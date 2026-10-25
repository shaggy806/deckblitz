import { defineCard } from "../define.js";

// EDHREC rank 25176.

const TEXT = "Whenever a player casts a red spell, you may gain 1 life.";

export default defineCard({
  name: "Kor Firewalker",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier"],
  power: 2,
  toughness: 2,
  text: `Protection from red\n${TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["R"] } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
