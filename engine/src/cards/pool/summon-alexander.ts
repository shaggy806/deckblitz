import { defineCard } from "../define.js";

// The back face of Crystal Fragments: a Saga creature.
//
// - Chapters I and II are a `damage-rule` over creatures you control, asked
//   as the damage would be dealt (rule 611.2c), so a creature arriving later
//   that turn is covered too.
const SHIELD_TEXT = "I, II — Prevent all damage that would be dealt to creatures you control this turn.";
const TAP_TEXT = "III — Tap all creatures your opponents control.";

export default defineCard({
  name: "Summon: Alexander",
  art: "https://cards.scryfall.io/art_crop/back/5/f/5f51c853-949d-44e9-a3a2-02e1ce69a147.jpg",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Construct"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${SHIELD_TEXT}\n${TAP_TEXT}\nFlying`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: { kind: "damage-rule", to: { permanents: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: SHIELD_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  faces: ["Crystal Fragments", "Summon: Alexander"],
  transform: true,
});
