import { defineCard } from "../define.js";

// EDHREC rank 6843.
//
// Rulings:
//   [2025-10-02] "Earthbend N" means "Target land you control becomes a 0/0 land creature with
//     haste in addition to its other types. Put N +1/+1 counters on it. When it dies or is exiled,
//     return it to the battlefield tapped under your control."
//   [2025-10-02] If the targeted land becomes an illegal target before the spell or ability that
//     includes earthbend resolves, earthbend does nothing. If the spell or ability didn't have
//     other targets, it won't resolve.
//   [2025-10-02] You may target a land that is already a creature, perhaps because of a previous
//     earthbend ability. The land will get the +1/+1 counters, gain haste, and have its base power
//     and toughness set to 0/0.
//
// Earthbend, then Fell the Mighty's shape: "power less than or equal to that
// land's power" is a `powerOf` the target operand, read after the counters
// are on (the land itself qualifies). The player half is its own effect.
export default defineCard({
  name: "Earthshape",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Earthbend 3. Then each creature you control with power less than or equal to that land's power gains hexproof and indestructible until end of turn. You gain hexproof until end of turn. (To earthbend 3, target land you control becomes a 0/0 creature with haste that's still a land. Put three +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)",
  targets: ["land-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "earthbend", target: 0, amount: 3 },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", power: { op: "lte", n: { amount: { powerOf: 0 } } } },
        keyword: "hexproof",
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", power: { op: "lte", n: { amount: { powerOf: 0 } } } },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      { kind: "grant-player-hexproof", who: "you" },
    ],
  },
});
