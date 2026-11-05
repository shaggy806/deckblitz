import { defineCard } from "../define.js";

export default defineCard({
  name: "Play of the Game",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  assist: true,
  text: "Assist (Another player can pay up to {6} of this spell's cost.)\nExile all nonland permanents.",
  targets: [],
  effect: { kind: "exile-all", filter: { notTypes: ["land"] } },
});
