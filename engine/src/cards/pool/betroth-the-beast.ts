import { defineCard } from "../define.js";


export default defineCard({
  name: "Betroth the Beast",
  art: "https://cards.scryfall.io/art_crop/back/5/9/5980a930-c7f8-45e1-a18a-87734d9ed09e.jpg",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create a Royal Role token attached to target creature you control. (Enchanted creature gets +1/+1 and has ward {1}.)",
  targets: ["creature-you-control"],
  effect: { kind: "create-token", token: "Royal Role Token", count: 1, attachedTo: 0 },
  faces: ["Besotted Knight", "Betroth the Beast"],
  adventure: true,
});
