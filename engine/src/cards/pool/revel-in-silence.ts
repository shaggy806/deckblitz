import { defineCard } from "../define.js";

// The back face of Flamescroll Celebrant // Revel in Silence.
//
// Rulings:
//   [2021-04-16] Casting Revel in Silence in response to a spell or ability won't affect that
//     spell or ability. That is, it's not countermagic.
//
// One `prohibit` for the turn: casting spells, and activating planeswalkers' loyalty abilities
// alone (`only: "loyalty"`, rule 606.1 — their other abilities, mana abilities among them, still
// work: The Immortal Sun's prohibition, for a turn). "Exile Revel in Silence" is `exileOnResolve`.

export default defineCard({
  name: "Revel in Silence",
  art: "https://cards.scryfall.io/art_crop/back/0/d/0dba25e3-2b4f-45d4-965f-3834bcb359ee.jpg",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Your opponents can't cast spells or activate planeswalkers' loyalty abilities this turn.\nExile Revel in Silence.",
  targets: [],
  effect: {
    kind: "prohibit",
    prohibits: [
      { act: "cast", who: "each-opponent" },
      { act: "activate", who: "each-opponent", of: { type: "planeswalker" }, only: "loyalty" },
    ],
  },
  faces: ["Flamescroll Celebrant", "Revel in Silence"],
  exileOnResolve: true,
});
