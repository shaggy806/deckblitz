import { defineCard } from "../define.js";

export default defineCard({
  name: "Wanderer's Strike",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target creature, then proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  targets: ["creature"],
  effect: { kind: "sequence", effects: [{ kind: "exile", target: 0 }, { kind: "proliferate" }] },
});
