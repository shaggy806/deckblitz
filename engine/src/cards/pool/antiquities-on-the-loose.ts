import { defineCard } from "../define.js";

// EDHREC rank 15327. "Cast from anywhere other than your hand" is a spell
// that was cast (a copy never was) and not from the hand — Transpose's
// `castFrom` source condition, negated, read as it resolves: a flashback cast
// puts the counters on, the two new tokens included.

export default defineCard({
  name: "Antiquities on the Loose",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  flashback: { cost: "{4}{W}{W}" },
  text: "Create two 2/2 red and white Spirit creature tokens. Then if this spell was cast from anywhere other than your hand, put a +1/+1 counter on each Spirit you control.\nFlashback {4}{W}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Spirit Token (Red-White 2/2)", count: 2 },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source", filter: { cast: true } },
            { kind: "not", of: { kind: "source", filter: { castFrom: "hand" } } },
          ],
        },
        then: { kind: "add-counter-all", filter: { subtype: "Spirit", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      },
    ],
  },
});
