import { defineCard } from "../define.js";

// King T'Challa's back face.

const PREVENT_TEXT = "Prevent all damage that would be dealt to Black Panther.";
const DRAW_TEXT = "Whenever Black Panther deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Black Panther, Hope Enduring",
  art: "https://cards.scryfall.io/art_crop/back/a/d/add7d3ce-aa58-4da0-8c2a-cfd01c3a8975.jpg",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Hero"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "double-strike"],
  text: `Flash\nDouble strike\n${PREVENT_TEXT}\n${DRAW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self" },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  faces: ["King T'Challa", "Black Panther, Hope Enduring"],
});
