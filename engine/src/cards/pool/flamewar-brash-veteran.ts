import { defineCard } from "../define.js";

// EDHREC rank 13349. Transformers. More Than Meets the Eye (rule 702.162a) is
// an alternative cost that casts the card converted, its back face (Flamewar,
// Streetwise Operative) up on the stack (712.11a). Convert is transform
// (701.28a). The intel cards come back by `return-to-hand-all`'s `from:
// "exile"`: every exiled card Flamewar's controller owns with an intel counter,
// face down or not — owner and counters aren't characteristics (rule 109.3),
// so a face-down card (406.3a) still shows them — whatever exiled it.
//
// Rulings:
//   [2022-10-14] The mana value of a converted permanent on the battlefield is equal to the mana
//     value of the card's front face, no matter which face is up.
//   [2022-10-14] A spell cast this way enters the battlefield with its back face up.
//   [2022-10-14] Converting a permanent doesn't affect any Auras or Equipment that are attached
//     to it. Similarly, any counters on the permanent will remain on that permanent after it
//     converts.

const MTMTE_TEXT = "More Than Meets the Eye {B}{R} (You may cast this card converted for {B}{R}.)";
const SAC_TEXT =
  "Sacrifice another artifact: Put a +1/+1 counter on Flamewar and convert it. Activate only as a sorcery.";
const INTEL_TEXT = "{1}, Discard your hand: Put all exiled cards you own with intel counters on them into your hand.";

export default defineCard({
  name: "Flamewar, Brash Veteran",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 2,
  text: `${MTMTE_TEXT}\n${SAC_TEXT}\n${INTEL_TEXT}`,
  faces: ["Flamewar, Brash Veteran", "Flamewar, Streetwise Operative"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{B}{R}" },
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "artifact" } } },
      otherOnly: true,
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "transform", target: "source" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      cost: { mana: "{1}", tap: false, do: { kind: "discard-hand", who: "you" } },
      targets: [],
      effect: {
        kind: "return-to-hand-all",
        from: "exile",
        filter: { ownedBy: "you", counters: { kind: "intel", compare: { op: "gte", n: 1 } } },
      },
      resolve: null,
      text: INTEL_TEXT,
    },
  ],
});
