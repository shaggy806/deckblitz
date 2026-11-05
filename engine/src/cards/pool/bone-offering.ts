import { defineCard } from "../define.js";

export default defineCard({
  name: "Bone Offering",
  art: "https://cards.scryfall.io/art_crop/back/3/7/37bd2e21-b292-4c86-bd01-010d4a1af7b2.jpg",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create a tapped 4/1 black Skeleton creature token with menace. (Then exile this card. You may cast the artifact later from exile.)",
  effect: {
    kind: "create-token",
    token: "Skeleton Token (Gut, True Soul Zealot)",
    count: 1,
    tapped: true,
  },
  faces: ["Altar of Bhaal", "Bone Offering"],
  adventure: true,
});
