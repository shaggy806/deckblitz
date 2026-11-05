import { defineCard } from "../define.js";


export default defineCard({
  name: "Transmutation",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Switch target creature's power and toughness until end of turn.",
  targets: ["creature"],
  effect: { kind: "switch-pt", target: 0, duration: "end-of-turn" },
});
