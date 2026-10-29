import { defineCard } from "../define.js";

// Only combat damage from unblocked creatures — not trample damage from a
// blocked one, nor noncombat damage (the ruling).
export default defineCard({
  name: "Weathered Bodyguards",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 5,
  morph: { keyword: "morph", cost: "{3}{W}" },
  text: "As long as this creature is untapped, all combat damage that would be dealt to you by unblocked creatures is dealt to this creature instead.\nMorph {3}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      replacement: {
        event: "would-deal-damage",
        to: "you",
        combat: true,
        source: { type: "creature", unblocked: true },
        redirect: "self",
      },
      text: "As long as this creature is untapped, all combat damage that would be dealt to you by unblocked creatures is dealt to this creature instead.",
    },
  ],
});
