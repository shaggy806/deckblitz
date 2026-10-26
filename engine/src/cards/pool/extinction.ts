import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 21154. The type is chosen as it resolves
// (Witch's Vengeance's shape), then every creature of it is destroyed.

export default defineCard({
  name: "Extinction",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all creatures of the creature type of your choice.",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: { kind: "destroy-all", filter: { type: "creature", subtype: "$chosen" } },
  },
});
