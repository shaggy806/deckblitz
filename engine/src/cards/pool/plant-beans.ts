import { defineCard } from "../define.js";

// EDHREC rank 7079 (Beanstalk Wurm's Adventure).
// The extra land play is cumulative with other such effects (the ruling).
export default defineCard({
  name: "Plant Beans",
  art: "https://cards.scryfall.io/art_crop/back/1/9/19f20c0a-22be-4a9c-96ce-4047f7a2d424.jpg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "You may play an additional land this turn. (Then exile this card. You may cast the creature later from exile.)",
  effect: { kind: "additional-land-drop", amount: 1 },
  faces: ["Beanstalk Wurm", "Plant Beans"],
  adventure: true,
});
