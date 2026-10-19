import { defineCard } from "../define.js";

export default defineCard({
  name: "Tyr's Blessing",
  art: "https://cards.scryfall.io/art_crop/back/b/4/b4590e53-ca8d-4896-a8cf-6af1e4bc456f.jpg",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Target creature gains indestructible until end of turn. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
  faces: ["Blessed Hippogriff", "Tyr's Blessing"],
  adventure: true,
});
