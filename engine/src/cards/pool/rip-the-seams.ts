import { defineCard } from "../define.js";

export default defineCard({
  name: "Rip the Seams",
  art: "https://cards.scryfall.io/art_crop/back/d/d/dd6ed252-c262-4062-97ba-75c50d6b5579.jpg",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Destroy target tapped creature. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: { kind: "destroy", target: 0 },
  faces: ["Threadbind Clique", "Rip the Seams"],
  adventure: true,
});
