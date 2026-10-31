import { defineCard } from "../define.js";

// "You may exile a black card with mana value X from your hand rather than
// pay this spell's mana cost": `exileFromHand` with `manaValueX` — X is the
// value announced as it's cast (rules 107.3a, 601.2b), the card exiled must
// have that mana value, and the spell's mana value on the stack counts it
// (202.3e).

export default defineCard({
  name: "Sickening Shoal",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "You may exile a black card with mana value X from your hand rather than pay this spell's mana cost.\nTarget creature gets -X/-X until end of turn.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["B"] }, text: "a black card", manaValueX: true } },
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: { product: ["x", -1] }, toughness: { product: ["x", -1] }, duration: "end-of-turn" },
});
