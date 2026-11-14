import { defineCard } from "../define.js";

// EDHREC rank 8632. Its bestow cost collects evidence too (`bestow`'s
// `collectEvidence`, rule 701.59a): the cards chosen as it's paid, the spell
// already on the stack (601.2h). "Using its bestow ability" is the graveyard
// permission's `using`: only bestowed, from there (rule 118.9a).

const ANTHEM = "Enchanted creature gets +2/+2 and has flying and haste.";
const SELF = "You may cast this card from your graveyard using its bestow ability.";

export default defineCard({
  name: "Detective's Phoenix",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  bestow: { cost: "{R}", collectEvidence: 6 },
  text: `Bestow—{R}, Collect evidence 6. (To pay this bestow cost, pay {R} and exile cards with total mana value 6 or greater from your graveyard.)\nFlying, haste\n${ANTHEM}\n${SELF}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], grantKeywords: ["flying", "haste"], text: ANTHEM }],
  mayPlaySelf: { from: ["graveyard"], using: "bestow" },
});
