import { defineCard } from "../define.js";

// EDHREC rank 2416.
//
// Rulings:
//   [2007-05-01] The +1/+1 counter won't affect Llanowar Reborn in any way unless another effect
//     turns it into a creature.

export default defineCard({
  name: "Llanowar Reborn",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {G}.\nGraft 1 (This land enters with a +1/+1 counter on it. Whenever a creature enters, you may move a +1/+1 counter from this land onto it.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
  // Graft 1 (rule 702.58a): "This permanent enters with a +1/+1 counter on
  // it" and "Whenever another creature enters, if this permanent has a +1/+1
  // counter on it, you may move a +1/+1 counter from this permanent onto that
  // creature" — an intervening if (603.4), and a move (122.5).
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Move a +1/+1 counter from Llanowar Reborn onto the creature that entered?",
        effect: { kind: "move-counters", from: "source", to: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: "Graft 1",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "Graft 1",
    },
  ],
});
