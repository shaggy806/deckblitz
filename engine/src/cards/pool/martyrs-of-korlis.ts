import { defineCard } from "../define.js";

// EDHREC rank 31953.
//
// Rulings:
//   If you have multiple Martyrs of Korlis, you can decide which one receives the redirected
//   damage each time artifact damage would be dealt to you.
//
// - Palisade Giant's redirection, narrowed to artifact sources and to you,
//   while this creature is untapped.
const TEXT =
  "As long as this creature is untapped, all damage that would be dealt to you by artifacts is dealt to this creature instead.";

export default defineCard({
  name: "Martyrs of Korlis",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 6,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      replacement: { event: "would-deal-damage", to: "you", source: { type: "artifact" }, redirect: "self" },
      text: TEXT,
    },
  ],
});
