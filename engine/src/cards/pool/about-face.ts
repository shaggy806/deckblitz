import { defineCard } from "../define.js";


export default defineCard({
  name: "About Face",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Switch target creature's power and toughness until end of turn.",
  targets: ["creature"],
  effect: { kind: "switch-pt", target: 0, duration: "end-of-turn" },
});
