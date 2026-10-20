import { defineCard } from "../define.js";

const pump = (power: number, toughness: number) =>
  ({
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power,
    toughness,
    duration: "end-of-turn",
  }) as const;

export default defineCard({
  name: "Dauntless Unity",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Kicker {1}{W} (You may pay an additional {1}{W} as you cast this spell.)\nCreatures you control get +1/+1 until end of turn. If this spell was kicked, those creatures get +2/+1 until end of turn instead.",
  targets: [],
  effect: pump(1, 1),
  kicker: { cost: "{1}{W}", effect: pump(2, 1) },
});
