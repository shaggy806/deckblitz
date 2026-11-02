import { defineCard } from "../define.js";

const MARCH_TEXT = "Relentless March — {X}, {T}, Tap X untapped artifacts you control: Target opponent loses X life.";

// X is paid twice over, in mana and in artifacts, and an artifact can't do both:
// one tapped for the mana is no longer untapped (rule 601.2h).
export default defineCard({
  name: "Necron Overlord",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron", "Noble"],
  power: 2,
  toughness: 5,
  text: MARCH_TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true, tapOthers: { count: "x", filter: { type: "artifact", controlledBy: "you" } } },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: "x", target: 0 },
      resolve: null,
      text: MARCH_TEXT,
    },
  ],
});
