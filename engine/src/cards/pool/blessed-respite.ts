import { defineCard } from "../define.js";

export default defineCard({
  name: "Blessed Respite",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target player shuffles their graveyard into their library. Prevent all combat damage that would be dealt this turn.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-graveyard-into-library", target: 0 },
      { kind: "prevent-all-combat-damage" },
    ],
  },
});
