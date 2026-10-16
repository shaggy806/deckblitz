import { defineCard } from "../define.js";

// EDHREC rank 9207.
// Boomerang, Blade Flinger's "deals … to each opponent" with Slash of Light's
// count of Equipment you control, read as the trigger resolves.

const ATTACK_TEXT = "Whenever Eivor attacks, it deals damage equal to the number of Equipment you control to each opponent.";

export default defineCard({
  name: "Eivor, Battle-Ready",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "haste"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\nHaste (This creature can attack as soon as it comes under your control.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "damage",
        who: "each-opponent",
        amount: { countOf: { subtype: "Equipment", controlledBy: "you" } },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
