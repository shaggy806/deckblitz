import { defineCard } from "../define.js";

export default defineCard({
  name: "Heart's Desire",
  art: "https://cards.scryfall.io/art_crop/back/4/f/4f80af9c-07a1-46f1-b869-146fda5922f4.jpg",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create a 1/1 white Human creature token. (Then exile this card. You may cast the creature later from exile.)",
  effect: { kind: "create-token", token: "Human Token", count: 1 },
  faces: ["Lovestruck Beast", "Heart's Desire"],
  adventure: true,
});
