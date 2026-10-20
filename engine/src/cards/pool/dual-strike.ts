import { defineCard } from "../define.js";

const TEXT =
  "When you next cast an instant or sorcery spell with mana value 4 or less this turn, copy that spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Dual Strike",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${TEXT}\nForetell {R} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { nextSpell: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 4 } } },
    effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
    text: TEXT,
  },
  foretell: { cost: "{R}" },
});
