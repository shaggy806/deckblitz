import { defineCard } from "../define.js";

export default defineCard({
  name: "Petty Revenge",
  art: "https://cards.scryfall.io/art_crop/back/b/d/bd78e8ae-e927-40e7-9580-966c5e81f53c.jpg",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Omen"],
  text: "Destroy target creature with power 3 or less. (Then shuffle this card into its owner's library.)",
  targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
  effect: { kind: "destroy", target: 0 },
  faces: ["Disruptive Stormbrood", "Petty Revenge"],
  omen: true,
});
