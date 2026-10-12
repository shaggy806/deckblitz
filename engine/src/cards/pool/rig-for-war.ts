import { defineCard } from "../define.js";

export default defineCard({
  name: "Rig for War",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +3/+0 and gains reach and first strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
