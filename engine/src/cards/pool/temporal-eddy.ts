import { defineCard } from "../define.js";

export default defineCard({
  name: "Temporal Eddy",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Put target creature or land on top of its owner's library.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
