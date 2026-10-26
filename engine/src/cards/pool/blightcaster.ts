import { defineCard } from "../define.js";

// EDHREC rank 17261.
//
// The target is mandatory — with only your own creatures around you must pick
// one — but the -2/-2 is a "may" (the ruling).

const TEXT = "Whenever you cast an enchantment spell, you may have target creature get -2/-2 until end of turn.";

export default defineCard({
  name: "Blightcaster",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get -2/-2 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
