import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 18063.

export default defineCard({
  name: "Rend Flesh",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Destroy target non-Spirit creature.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", notSubtypes: ["Spirit"] } }],
  effect: { kind: "destroy", target: 0 },
});
