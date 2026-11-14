import { defineCard } from "../define.js";

// Hildibrand Manderville's Adventure.
export default defineCard({
  name: "Gentleman's Rise",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Create a 2/2 black Zombie creature token.",
  targets: [],
  effect: { kind: "create-token", token: "Zombie Token", count: 1 },
  faces: ["Hildibrand Manderville", "Gentleman's Rise"],
  adventure: true,
});
