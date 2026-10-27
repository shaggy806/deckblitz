import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 14043.
//
// The return-an-Island alternative cost, as Thwart's; "you may tap or
// untap" is Retreat to Coralhelm's zero-or-one modal.

export default defineCard({
  name: "Tidal Bore",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may return an Island you control to its owner's hand rather than pay this spell's mana cost.\nYou may tap or untap target creature.",
  alternativeCost: {
    mana: "{0}",
    returnToHand: { filter: { type: "land", subtype: "Island" }, text: "an Island you control" },
  },
  targets: ["creature"],
  effect: {
    kind: "modal",
    minModes: 0,
    maxModes: 1,
    modes: [
      { text: "Tap target creature.", effect: { kind: "tap", target: 0 } },
      { text: "Untap target creature.", effect: { kind: "untap", target: 0 } },
    ],
  },
});
