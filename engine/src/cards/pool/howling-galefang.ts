import { defineCard } from "../define.js";

// EDHREC rank 26068.
//
// Rulings:
//   [2023-09-01] Howling Galefang will have haste as long as any card you own in exile has an
//     Adventure. It doesn't matter if that card was cast as an Adventure or not.

export default defineCard({
  name: "Howling Galefang",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nThis creature has haste as long as you own a card in exile that has an Adventure.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-exile", atLeast: 1, filter: { ownedBy: "you", hasAdventure: true } },
      grantKeywords: ["haste"],
      text: "This creature has haste as long as you own a card in exile that has an Adventure.",
    },
  ],
});
