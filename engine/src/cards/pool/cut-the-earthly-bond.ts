import { defineCard } from "../define.js";

export default defineCard({
  name: "Cut the Earthly Bond",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Return target enchanted permanent to its owner's hand.",
  targets: [{ kind: "permanent", filter: { enchanted: true } }],
  effect: { kind: "return-to-hand", target: 0 },
});
