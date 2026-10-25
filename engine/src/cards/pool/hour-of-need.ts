import { defineCard } from "../define.js";

export default defineCard({
  name: "Hour of Need",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Strive — This spell costs {1}{U} more to cast for each target beyond the first.\nExile any number of target creatures. For each creature exiled this way, its controller creates a 4/4 blue Sphinx creature token with flying.",
  costPerExtraTarget: "{1}{U}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
      {
        kind: "create-token",
        token: "4/4 Blue Sphinx Token (Flying)",
        who: "each-player",
        count: { thisWay: "exiled", who: "each" },
      },
    ],
  },
});
