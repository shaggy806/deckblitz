import { defineCard } from "../define.js";

// EDHREC rank 23543.
//
// A prevention effect (rule 615) on any creature's damage to another
// creature, whoever controls either, read as the damage would be dealt
// (`sharesColorWithRecipient`): a creature's damage to itself isn't
// "another", and a colorless one shares no color.
const TEXT = "Prevent all damage that would be dealt to a creature by another creature if they share a color.";

export default defineCard({
  name: "Well-Laid Plans",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { prevent: true },
        source: { type: "creature" },
        toFilter: { type: "creature" },
        sharesColorWithRecipient: true,
      },
      text: TEXT,
    },
  ],
});
