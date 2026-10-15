import { defineCard } from "../define.js";

// EDHREC rank 17231.
//
// HULK SMASH!'s shape: one mode, or both when cast using teamwork
// (`kickedModes`, rule 702.194), each mode with its own target.

export default defineCard({
  name: "Murdock's Crusade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "teamwork", teamwork: 4 },
  text:
    "Teamwork 4 (As an additional cost to cast this spell, you may tap any number of creatures you control with total power 4 or more.)\n" +
    "Choose one. If this spell was cast using teamwork, choose both instead.\n" +
    "• Street Justice — Exile target creature with toughness 4 or greater.\n" +
    "• Legal Justice — Exile target enchantment with mana value 4 or greater.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Street Justice — Exile target creature with toughness 4 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", toughness: { op: "gte", n: 4 } } }],
        effect: { kind: "exile", target: 0 },
      },
      {
        text: "Legal Justice — Exile target enchantment with mana value 4 or greater.",
        targets: [{ kind: "permanent", filter: { type: "enchantment", manaValue: { op: "gte", n: 4 } } }],
        effect: { kind: "exile", target: 0 },
      },
    ],
  },
});
