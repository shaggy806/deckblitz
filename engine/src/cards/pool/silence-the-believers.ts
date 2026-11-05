import { defineCard } from "../define.js";

// Each creature and the Auras on it are exiled in one event with all the
// others (the ruling: a bestowed Aura is exiled, not left as a creature), the
// Auras found while still attached.
export default defineCard({
  name: "Silence the Believers",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Strive — This spell costs {2}{B} more to cast for each target beyond the first.\n" +
    "Exile any number of target creatures and all Auras attached to them.",
  costPerExtraTarget: "{2}{B}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "exile-all", filter: { subtype: "Aura", attachedToTarget: 0 } },
        { kind: "exile", target: 0 },
      ],
    },
  },
});
