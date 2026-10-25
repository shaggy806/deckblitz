import { defineCard } from "../define.js";

// EDHREC rank 27402. The kicked spell's whole effect is -2/-2 in place of
// -1/-1, on the same target player's creatures.

const effect = (n: number) =>
  ({
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    power: -n,
    toughness: -n,
    duration: "end-of-turn",
  }) as const;

export default defineCard({
  name: "Marsh Casualties",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {3} (You may pay an additional {3} as you cast this spell.)\nCreatures target player controls get -1/-1 until end of turn. If this spell was kicked, those creatures get -2/-2 until end of turn instead.",
  targets: ["player"],
  effect: effect(1),
  kicker: { cost: "{3}", effect: effect(2) },
});
