import { defineCard } from "../define.js";

// EDHREC rank 25505.
//
// Rulings:
//   [2004-10-04] As you activate the ability, the targets you choose must be two artifacts, two
//     creatures, or two lands. As the ability resolves, both targets will be legal only if they
//     are two artifacts, two creatures, or two lands at that time as well.
//   [2004-10-04] If one of the targets is illegal by the time the ability resolves, the exchange
//     doesn't happen. Since the exchange doesn't happen, no Auras are destroyed.
//
// The second slot shares artifact, creature or land with the first
// (`shares`' `among` — Legerdemain); the Auras are destroyed only once the
// exchange happened (`exchange-control`'s `then`).
const TEXT =
  "{5}, Sacrifice this artifact: Exchange control of target artifact, creature, or land you control and target permanent an opponent controls that shares one of those types with it. If those permanents are exchanged this way, destroy all Auras attached to them.";

export default defineCard({
  name: "Gauntlets of Chaos",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: false, sacrifice: "self" },
      targets: [
        { kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature", "land"] } },
        {
          kind: "other",
          of: { kind: "permanent", whose: "opponent", filter: {} },
          than: { slot: 0 },
          shares: { kind: "card", among: ["artifact", "creature", "land"] },
        },
      ],
      effect: {
        kind: "exchange-control",
        objects: [0, 1],
        then: {
          kind: "destroy-all",
          filter: { subtype: "Aura", anyOf: [{ attachedToTarget: 0 }, { attachedToTarget: 1 }] },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
