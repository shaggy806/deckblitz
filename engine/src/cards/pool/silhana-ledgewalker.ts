import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 10124. Treetop Rangers' evasion, with hexproof.
//
// Rulings:
//   [2007-05-01] Creatures with reach (such as Giant Spider) don't actually have flying, so they
//     can't block this.

const TEXT = "This creature can't be blocked except by creatures with flying.";

export default defineCard({
  name: "Silhana Ledgewalker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["hexproof"],
  text: `Hexproof (This creature can't be the target of spells or abilities your opponents control.)\n${TEXT}`,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { notKeyword: "flying" }, text: TEXT }],
});
