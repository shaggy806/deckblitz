import { defineCard } from "../define.js";

export default defineCard({
  name: "Righteousness",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target blocking creature gets +7/+7 until end of turn.",
  targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
  effect: { kind: "modify-pt", target: 0, power: 7, toughness: 7, duration: "end-of-turn" },
});
