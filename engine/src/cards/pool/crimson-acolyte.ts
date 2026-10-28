import { defineCard } from "../define.js";

// EDHREC rank 27976.
const TEXT = "{W}: Target creature gains protection from red until end of turn.";

export default defineCard({
  name: "Crimson Acolyte",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: `Protection from red\n${TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-protection", target: 0, from: { colors: ["R"] }, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
