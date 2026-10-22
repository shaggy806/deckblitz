import { defineCard } from "../define.js";

// EDHREC rank 16738.
//
// Rulings:
//   Unlike other cards in this set that care only whether you control a
//   Desert or there is a Desert card in your graveyard, Ramunap Hydra's
//   abilities reward you for meeting both conditions. If you control one or
//   more Deserts and have one or more Desert cards in your graveyard, it'll
//   get +2/+2.

export default defineCard({
  name: "Ramunap Hydra",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Hydra"],
  power: 3,
  toughness: 3,
  keywords: ["reach", "vigilance", "trample"],
  text:
    "Reach, vigilance, trample\nThis creature gets +1/+1 as long as you control a Desert.\nThis creature gets +1/+1 as long as there is a Desert card in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control a Desert.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as there is a Desert card in your graveyard.",
    },
  ],
});
