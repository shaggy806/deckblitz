import { defineCard } from "../define.js";

export default defineCard({
  name: "Seize the Initiative",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +1/+1 and gains first strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
