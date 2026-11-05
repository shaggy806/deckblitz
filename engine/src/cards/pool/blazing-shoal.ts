import { defineCard } from "../define.js";

export default defineCard({
  name: "Blazing Shoal",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "You may exile a red card with mana value X from your hand rather than pay this spell's mana cost.\nTarget creature gets +X/+0 until end of turn.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["R"] }, manaValueX: true, text: "Exile a red card with mana value X from your hand" } },
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: "x", toughness: 0, duration: "end-of-turn" },
});
