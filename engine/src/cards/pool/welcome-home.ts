import { defineCard } from "../define.js";

// The Adventure half of Flaxen Intruder // Welcome Home (rule 715).

export default defineCard({
  name: "Welcome Home",
  art: "https://cards.scryfall.io/art_crop/back/0/6/06bd1ad2-fb5d-4aef-87d1-13a341c686fa.jpg",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create three 2/2 green Bear creature tokens. (Then exile this card. You may cast the creature later from exile.)",
  targets: [],
  effect: { kind: "create-token", token: "Bear Token", count: 3 },
  faces: ["Flaxen Intruder", "Welcome Home"],
  adventure: true,
});
