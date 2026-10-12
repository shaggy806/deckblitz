import { defineCard } from "../define.js";

export default defineCard({
  name: "Lava Flow",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target creature or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
  effect: { kind: "destroy", target: 0 },
});
