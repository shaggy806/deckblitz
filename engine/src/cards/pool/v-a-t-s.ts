import { defineCard } from "../define.js";

// Any number of creatures, all of one toughness (`equalToughness`), checked as
// it's cast and again as it resolves over the ones still legal: no longer all
// equal, none is destroyed; a lone one always is (the rulings; rule 608.2b).
export default defineCard({
  name: "V.A.T.S.",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  splitSecond: true,
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nChoose any number of target creatures with equal toughness. Destroy the chosen creatures.",
  targets: [{ kind: "any-number", of: "creature", equalToughness: true }],
  effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "destroy", target: 0 } },
});
