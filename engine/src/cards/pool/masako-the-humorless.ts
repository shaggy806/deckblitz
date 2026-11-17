import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK).
//
// `blocksAsThoughUntapped` lifts rule 509.1a's "must be untapped" for the creatures it affects
// and nothing else: a tapped creature that can't block, or can't block a flier, still can't
// (the ruling). Read in `combat/eligibility.ts`'s `readyToBlock`.

export default defineCard({
  name: "Masako the Humorless",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: "Flash\nTapped creatures you control can block as though they were untapped.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      blocksAsThoughUntapped: true,
      text: "Tapped creatures you control can block as though they were untapped.",
    },
  ],
});
