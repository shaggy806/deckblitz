import { defineCard } from "../define.js";

export default defineCard({
  name: "Forum's Favor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target creature gets +1/+0 and gains flying until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
    ],
  },
  prepareSpellOnly: true,
});
