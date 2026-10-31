import { defineCard } from "../define.js";

// Sickening Shoal's `exileFromHand` `manaValueX`, for a green card.

export default defineCard({
  name: "Nourishing Shoal",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "You may exile a green card with mana value X from your hand rather than pay this spell's mana cost.\nYou gain X life.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["G"] }, text: "a green card", manaValueX: true } },
  effect: { kind: "gain-life", amount: "x" },
});
