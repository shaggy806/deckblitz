import { defineCard } from "../define.js";

const TEXT =
  "When you next cast an instant or sorcery spell this turn, copy that spell X times. You may choose new targets for the copies.";

export default defineCard({
  name: "Storm King's Thunder",
  manaCost: "{X}{R}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
    effect: {
      kind: "repeat",
      times: "x",
      effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
    },
    text: TEXT,
  },
});
