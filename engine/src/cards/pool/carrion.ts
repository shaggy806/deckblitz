import { defineCard } from "../define.js";

export default defineCard({
  name: "Carrion",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nCreate X 0/1 black Insect creature tokens, where X is the sacrificed creature's power.",
  targets: [],
  effect: { kind: "create-token", token: "Insect Token (Black, 0/1)", count: { powerOf: "sacrificed" } },
});
