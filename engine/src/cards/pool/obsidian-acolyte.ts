import { defineCard } from "../define.js";

// EDHREC rank 28078.

export default defineCard({
  name: "Obsidian Acolyte",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "Protection from black\n{W}: Target creature gains protection from black until end of turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-protection", target: 0, from: { colors: ["B"] }, duration: "end-of-turn" },
      resolve: null,
      text: "{W}: Target creature gains protection from black until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
