import { defineCard } from "../define.js";

/**
 * Goldmeadow Lookout's token: a 1/1 white Kithkin Soldier *named* Goldmeadow
 * Harrier. "Goldmeadow Harrier" is already the real card (whose {W} mana cost
 * a token mustn't have), so it's keyed " Token" and named by `tokenName`
 * (Ajani's Pridemate Token's shape). Scryfall lists no token printing for it:
 * the art is the card Goldmeadow Harrier's (DDF #3).
 */
export default defineCard({
  name: "Goldmeadow Harrier Token",
  tokenName: "Goldmeadow Harrier",
  art: "e5fc15af-532d-4124-9dd4-2584c00c89da",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 1,
  toughness: 1,
  text: "{W}, {T}: Tap target creature.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{W}, {T}: Tap target creature.",
    },
  ],
});
