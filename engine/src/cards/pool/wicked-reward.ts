import { defineCard } from "../define.js";

export default defineCard({
  name: "Wicked Reward",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nTarget creature gets +4/+2 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 4, toughness: 2, duration: "end-of-turn" },
});
