import { defineCard } from "../define.js";

// A triggered ability, not a tap ability: it needs something else to tap the
// creature (attacking, crewing), and only an untapped-to-tapped change fires
// it (rule 701.26a — the `becomes-tapped` event).
const TAPPED = "Whenever this creature becomes tapped, target creature can't block this turn.";

export default defineCard({
  name: "Renegade Wheelsmith",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Pilot"],
  power: 3,
  toughness: 2,
  text: TAPPED,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: TAPPED,
    },
  ],
});
