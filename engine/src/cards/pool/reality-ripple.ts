import { defineCard } from "../define.js";

export default defineCard({
  name: "Reality Ripple",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target artifact, creature, or land phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before its controller untaps during their next untap step.)",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: { kind: "phase-out", target: 0 },
});
