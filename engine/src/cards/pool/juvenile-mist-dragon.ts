import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const CLOUDS_TEXT =
  "Confounding Clouds — When this creature enters, for each opponent, tap up to one target creature that player controls. Each of those creatures doesn't untap during its controller's next untap step.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Juvenile Mist Dragon",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${CLOUDS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0, doesntUntapNext: true },
          { kind: "tap", target: 1, doesntUntapNext: true },
          { kind: "tap", target: 2, doesntUntapNext: true },
        ],
      },
      resolve: null,
      text: CLOUDS_TEXT,
    },
  ],
});
