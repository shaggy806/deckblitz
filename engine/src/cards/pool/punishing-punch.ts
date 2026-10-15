import { defineCard } from "../define.js";

// EDHREC rank 17718.
//
// Thing Swing's damage: the first target's power read as it resolves, twice
// over, dealt by that creature. With it gone, nothing is dealt.

export default defineCard({
  name: "Punishing Punch",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text:
    "This spell costs {2} less to cast if there are two or more creature cards in your graveyard.\n" +
    "Target creature you control deals damage equal to twice its power to target creature an opponent controls.",
  selfCostReduction: {
    condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { type: "creature" } },
    reduceGeneric: 2,
  },
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "damage", amount: { product: [{ powerOf: 0 }, 2] }, target: 1, from: { target: 0 } },
});
