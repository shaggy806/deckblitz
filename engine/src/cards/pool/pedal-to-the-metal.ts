import { defineCard } from "../define.js";

export default defineCard({
  name: "Pedal to the Metal",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +X/+0 and gains first strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
