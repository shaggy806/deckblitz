import { defineCard } from "../define.js";

export default defineCard({
  name: "Daring Leap",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Target creature gets +1/+1 and gains flying and first strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
