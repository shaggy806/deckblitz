import { defineCard } from "../define.js";

// EDHREC rank 1929.
//
// Any number of other creatures you control phase out at once (rule
// 702.26b), Auras and Equipment with them (702.26g), until their
// controller's next untap step — under whoever controls each then (a stolen
// one whose control effect ended meanwhile comes back to its owner, the
// rulings).
const ETB =
  "When this creature enters, any number of other target creatures you control phase out. (Treat them and anything attached to them as though they don't exist until their controller's next turn.)";

export default defineCard({
  name: "Guardian of Faith",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Knight"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "vigilance"],
  text: `Flash\nVigilance\n${ETB}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "other", of: "creature-you-control" } }],
      effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "phase-out", target: 0 } },
      resolve: null,
      text: ETB,
    },
  ],
});
