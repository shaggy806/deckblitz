import { defineCard } from "../define.js";

export default defineCard({
  name: "Tok-Tok, Volcano Born",
  art: "https://cards.scryfall.io/art_crop/front/6/e/6ee6cd34-c117-4d7e-97d1-8f8464bfaac8.jpg",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 2,
  text: "Protection from red\nIf a red source would deal damage to a player, it deals that much damage plus 1 to that player instead.",
  static: [
    { affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", plus: 1, source: { colors: ["R"] }, to: "player" },
      text: "If a red source would deal damage to a player, it deals that much damage plus 1 to that player instead.",
    },
  ],
  faces: ["Akki Lavarunner", "Tok-Tok, Volcano Born"],
  flip: true,
});
