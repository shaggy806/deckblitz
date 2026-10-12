import { defineCard } from "../define.js";

export default defineCard({
  name: "Awaken the Bear",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +3/+3 and gains trample until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
