import { defineCard } from "../define.js";

export default defineCard({
  name: "Rescue the Foal",
  art: "https://cards.scryfall.io/art_crop/back/1/d/1d958ec3-1ddc-4622-9089-cbe5b3b47c90.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Exile target creature you control, then return that card to the battlefield under its owner's control. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature-you-control"],
  effect: { kind: "flicker", target: 0 },
  faces: ["Pegasus Guardian", "Rescue the Foal"],
  adventure: true,
});
