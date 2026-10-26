import { defineCard } from "../define.js";

export default defineCard({
  name: "Rush of Blood",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +X/+0 until end of turn, where X is its power.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: { powerOf: 0 }, toughness: 0, duration: "end-of-turn" },
});
