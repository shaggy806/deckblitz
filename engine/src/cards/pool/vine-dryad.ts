import { defineCard } from "../define.js";

// EDHREC rank 27261.

export default defineCard({
  name: "Vine Dryad",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 1,
  toughness: 3,
  keywords: ["flash", "forestwalk"],
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["G"] }, text: "a green card" } },
  text: "You may exile a green card from your hand rather than pay this spell's mana cost.\nFlash\nForestwalk (This creature can't be blocked as long as defending player controls a Forest.)",
});
