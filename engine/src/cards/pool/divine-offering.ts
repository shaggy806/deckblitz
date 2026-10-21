import { defineCard } from "../define.js";

// Legends. EDHREC rank 15541.
//
// Rulings:
//   [2004-10-04] If the target artifact becomes illegal before resolution, you do not gain any life.
//   [2004-10-04] If Divine Offering resolves, but the artifact regenerates or has indestructible,
//     you'll still gain the life.
//
// "Its mana value" is read as the artifact last existed if the destroy moved
// it (rule 608.2h — Artifact Mutation's shape), or as it is if it survived.
export default defineCard({
  name: "Divine Offering",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target artifact. You gain life equal to its mana value.",
  targets: ["artifact"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: { manaValueOf: 0 } },
    ],
  },
});
