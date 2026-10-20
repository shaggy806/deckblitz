import { defineCard } from "../define.js";

// EDHREC rank 21160.
//
// Its colour is read as the spell resolves: a black permanent is exiled
// instead of phasing out. Phased out, it comes back in during the untap step
// of the player who controlled it as it phased out (rule 702.26b — the
// rulings), with what's attached to it.

export default defineCard({
  name: "Divine Smite",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature or planeswalker an opponent controls phases out. If that permanent is black, exile it instead. (If it phases out, treat it and anything attached to it as though they don't exist until its controller's next turn.)",
  targets: [
    {
      kind: "permanent",
      whose: "opponent",
      filter: { typesAnyOf: ["creature", "planeswalker"] },
    },
  ],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { colors: ["B"] } },
    then: { kind: "exile", target: 0 },
    else: { kind: "phase-out", target: 0 },
  },
});
