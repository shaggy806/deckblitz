import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, choose target nonland permanent you control and up to two target nonland permanents you don't control. Destroy one of them at random.";

const THEIRS: TargetSpec = {
  kind: "permanent",
  filter: { notTypes: ["land"], not: { controlledBy: "you" } },
};

// Wild Swing's shape: picked as it resolves, among the targets still legal (an
// illegal one's slot is blank, so its mode's condition fails).
export default defineCard({
  name: "Capricious Efreet",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 6,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [
        { kind: "permanent", filter: { notTypes: ["land"], controlledBy: "you" } },
        { kind: "optional", of: THEIRS },
        { kind: "optional", of: { kind: "other", of: THEIRS, than: { slots: [1] } } },
      ],
      effect: {
        kind: "modal",
        random: true,
        minModes: 1,
        maxModes: 1,
        modes: [0, 1, 2].map((slot) => ({
          text: `Destroy target ${slot + 1}`,
          onlyIf: { kind: "target" as const, index: slot, filter: {} },
          effect: { kind: "destroy" as const, target: slot },
        })),
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
