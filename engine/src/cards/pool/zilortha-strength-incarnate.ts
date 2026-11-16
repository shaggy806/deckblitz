import { defineCard } from "../define.js";

// Lethal damage by power (`lethalDamageByPower`, rule 613.11): every reading
// of lethal damage — the state-based action (704.5g), the combat damage split
// and trample (702.19b), "excess damage" (120.4a — Flame Spill, the ruling) —
// measures a creature its controller controls against its power, at least 1
// (a 0-power creature dies only once it has damage marked: the ruling).
// Toughness 0 still kills it (704.5f, the ruling), and damage already marked
// becomes lethal, or stops being so, as Zilortha comes and goes (the ruling).
// See docs/plans/lethal-damage-by-power.md.
export default defineCard({
  name: "Zilortha, Strength Incarnate",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 7,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nLethal damage dealt to creatures you control is determined by their power rather than their toughness.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      lethalDamageByPower: true,
      text: "Lethal damage dealt to creatures you control is determined by their power rather than their toughness.",
    },
  ],
});
