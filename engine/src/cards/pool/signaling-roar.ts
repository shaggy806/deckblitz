import { defineCard } from "../define.js";

export default defineCard({
  name: "Signaling Roar",
  art: "https://cards.scryfall.io/art_crop/back/3/1/312f7072-3bf8-449f-bfb7-93727ef26c66.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Omen"],
  text: "Create a 2/2 white Soldier creature token. (Then shuffle this card into its owner's library.)",
  effect: { kind: "create-token", token: "Soldier Token (White 2/2)", count: 1 },
  faces: ["Riling Dawnbreaker", "Signaling Roar"],
  omen: true,
});
