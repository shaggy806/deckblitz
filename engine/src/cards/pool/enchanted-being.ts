import { defineCard } from "../define.js";

// EDHREC rank 32058.
//
// "Enchanted creatures" are creatures with an Aura attached, whoever controls
// the Aura (`enchanted`), read as the damage would be dealt.

const TEXT = "Prevent all combat damage that would be dealt to this creature by enchanted creatures.";

export default defineCard({
  name: "Enchanted Being",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        prevent: true,
        to: "self",
        source: { type: "creature", enchanted: true },
      },
      text: TEXT,
    },
  ],
});
