import { defineCard } from "../define.js";

// Lindblum, Industrial Regency's Adventure.
export default defineCard({
  name: "Mage Siege",
  art: "https://cards.scryfall.io/art_crop/front/5/4/548dd152-f0b6-4e8f-9afc-a4ec1671b648.jpg",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: 'Create a 0/1 black Wizard creature token with "Whenever you cast a noncreature spell, this token deals 1 damage to each opponent." (Then exile this card. You may play the land later from exile.)',
  targets: [],
  effect: { kind: "create-token", token: "Wizard Token (Kuja)", count: 1 },
});
