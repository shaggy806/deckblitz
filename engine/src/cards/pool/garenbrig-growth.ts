import { defineCard } from "../define.js";

// The Adventure half of Virtue of Strength.

export default defineCard({
  name: "Garenbrig Growth",
  art: "https://cards.scryfall.io/art_crop/back/f/f/ff857d41-767d-4e99-83cc-444738341b92.jpg",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Return target creature or land card from your graveyard to your hand. (Then exile this card. You may cast the enchantment later from exile.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["creature", "land"] } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  faces: ["Virtue of Strength", "Garenbrig Growth"],
  adventure: true,
});
