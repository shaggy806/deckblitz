import { defineCard } from "../define.js";

// Rule 701.12b: if either target is illegal as it resolves, nothing changes
// hands (the ruling).
export default defineCard({
  name: "Shrewd Negotiation",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exchange control of target artifact you control and target artifact or creature you don't control.",
  targets: [
    { kind: "permanent", whose: "you", filter: { type: "artifact" } },
    { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } },
  ],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
