import { defineCard } from "../define.js";

// One event (rule 603.10a): the target and that player's tokens of its name.
// A nontoken namesake stays (`sameNameTokensOnly`); the target needn't be a token.

export default defineCard({
  name: "Legions to Ashes",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Exile target nonland permanent an opponent controls and all tokens that player controls with the same name as that permanent.",
  targets: [{ kind: "permanent", filter: { notTypes: ["land"], controlledBy: "opponent" } }],
  effect: {
    kind: "exile-all",
    filter: { controlledBy: "you", sameNameAsTarget: 0, sameNameTokensOnly: true },
    controlledByTarget: 0,
  },
});
