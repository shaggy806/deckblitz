import { defineCard } from "../define.js";

// A 2/2 red and green Worm creature token with "This token can't block." —
// Cleveland Booker, Empath's.
export default defineCard({
  name: "2/2 Red Green Worm Token",
  tokenName: "Worm Token",
  art: "e7cde898-fc1f-4261-8f71-cfc4275bab54",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Worm"],
  power: 2,
  toughness: 2,
  text: "This token can't block.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This token can't block.",
    },
  ],
});
