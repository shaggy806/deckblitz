import { defineCard } from "../define.js";

// Both creatures are tapped, then each one's Equipment is unattached; a target
// gone illegal is neither (the ruling) — its slot's `attachedToTarget` then
// matches nothing.
export default defineCard({
  name: "Fulgent Distraction",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose two target creatures. Tap those creatures, then unattach all Equipment from them.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0 },
      { kind: "tap", target: 1 },
      {
        kind: "for-each-permanent",
        filter: { subtype: "Equipment", attachedToTarget: 0 },
        as: 2,
        simultaneous: true,
        effect: { kind: "unattach", target: 2 },
      },
      {
        kind: "for-each-permanent",
        filter: { subtype: "Equipment", attachedToTarget: 1 },
        as: 2,
        simultaneous: true,
        effect: { kind: "unattach", target: 2 },
      },
    ],
  },
});
