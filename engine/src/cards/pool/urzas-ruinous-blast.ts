import { defineCard } from "../define.js";

export default defineCard({
  name: "Urza's Ruinous Blast",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["sorcery"],
  text: "(You may cast a legendary sorcery only if you control a legendary creature or planeswalker.)\nExile all nonland permanents that aren't legendary.",
  effect: { kind: "exile-all", filter: { notTypes: ["land"], notSupertype: "legendary" } },
});
