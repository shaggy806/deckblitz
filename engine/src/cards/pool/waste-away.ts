import { defineCard } from "../define.js";

export default defineCard({
  name: "Waste Away",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, discard a card.\nTarget creature gets -5/-5 until end of turn.",
  additionalCost: { discard: 1 },
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
});
