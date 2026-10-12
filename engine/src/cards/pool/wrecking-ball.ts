import { defineCard } from "../define.js";

export default defineCard({
  name: "Wrecking Ball",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Destroy target creature or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
