import { defineCard } from "../define.js";

export default defineCard({
  name: "Fissure",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target creature or land. It can't be regenerated.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
});
