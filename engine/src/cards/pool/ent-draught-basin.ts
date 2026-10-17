import { defineCard } from "../define.js";

// EDHREC rank 19193.
//
// "Target creature with power X": the target filter reads the X the ability
// was activated with (`n: "x"` — The Mycosynth Gardens' shape), so a creature
// whose power has changed by resolution is no longer a legal target.

const TEXT = "{X}, {T}: Put a +1/+1 counter on target creature with power X. Activate only as a sorcery.";

export default defineCard({
  name: "Ent-Draught Basin",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      sorcerySpeed: true,
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "eq", n: "x" } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
