import { defineCard } from "../define.js";

export default defineCard({
  name: "Skillful Lunge",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+0 and gains first strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
