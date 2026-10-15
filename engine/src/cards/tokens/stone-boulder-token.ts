import { defineCard } from "../define.js";

// Stone-Giant of High Pass's token: a 3/1 colorless Wall artifact creature
// with defender *named* Stone Boulder — keyed " Token", named by `tokenName`.

export default defineCard({
  name: "Stone Boulder Token",
  tokenName: "Stone Boulder",
  art: "3440e247-a733-4609-9d80-d4a5fc58ae46",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 3,
  toughness: 1,
  keywords: ["defender"],
  text: "Defender",
});
