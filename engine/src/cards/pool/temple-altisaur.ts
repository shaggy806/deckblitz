import { defineCard } from "../define.js";

// Per source (the rulings): each source's damage to another Dinosaur is cut
// to 1; Temple Altisaur's own damage isn't touched.
export default defineCard({
  name: "Temple Altisaur",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 4,
  text: "If a source would deal damage to another Dinosaur you control, prevent all but 1 of that damage.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        toFilter: { subtype: "Dinosaur", controlledBy: "you" },
        toOther: true,
        preventAllBut: 1,
      },
      text: "If a source would deal damage to another Dinosaur you control, prevent all but 1 of that damage.",
    },
  ],
});
