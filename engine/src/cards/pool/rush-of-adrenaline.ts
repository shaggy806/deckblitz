import { defineCard } from "../define.js";

export default defineCard({
  name: "Rush of Adrenaline",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +2/+1 and gains trample until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
