import { defineCard } from "../define.js";

// The nightbound face of Brutal Cathar. A card exiled by the front face's
// ability stays exiled through the transform and comes back when this
// permanent leaves the battlefield, whichever face is up then.

export default defineCard({
  name: "Moonrage Brute",
  art: "https://cards.scryfall.io/art_crop/back/0/d/0dbac7ce-a6fa-466e-b6ba-173cf2dec98e.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike", "nightbound"],
  text: "First strike\nWard—Pay 3 life.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { payLife: 3 } },
      resolve: null,
      text: "Ward—Pay 3 life.",
    },
    {
      // The other half of Brutal Cathar's "until this creature leaves the
      // battlefield" (rule 610.3), which the back face must carry too.
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card.",
    },
  ],
  faces: ["Brutal Cathar", "Moonrage Brute"],
  transform: true,
});
