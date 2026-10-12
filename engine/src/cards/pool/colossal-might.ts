import { defineCard } from "../define.js";

export default defineCard({
  name: "Colossal Might",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "Target creature gets +4/+2 and gains trample until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 4, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
