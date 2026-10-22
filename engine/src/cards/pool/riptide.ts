import { defineCard } from "../define.js";

export default defineCard({
  name: "Riptide",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap all blue creatures.",
  targets: [],
  effect: { kind: "tap-all", filter: { type: "creature", colors: ["U"] } },
});
