import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 11133.
//
// Rulings:
//   [2011-09-22] You can sacrifice any Pentavite creature you control (such as an Adaptive
//     Automaton with Pentavite as its chosen type) to activate Pentavus’s second activated
//     ability, not just ones created by Pentavus’s other abilities.
//   [2011-09-22] You can remove any +1/+1 counter on Pentavus to activate its first activated
//     ability, not just ones created by Pentavus’s other abilities.

export default defineCard({
  name: "Pentavus",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 0,
  text: "This creature enters with five +1/+1 counters on it.\n{1}, Remove a +1/+1 counter from this creature: Create a 1/1 colorless Pentavite artifact creature token with flying.\n{1}, Sacrifice a Pentavite: Put a +1/+1 counter on this creature.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Pentavite Token", count: 1 },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from this creature: Create a 1/1 colorless Pentavite artifact creature token with flying.",
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { subtype: "Pentavite" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice a Pentavite: Put a +1/+1 counter on this creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 5 } },
      text: "This creature enters with five +1/+1 counters on it.",
    },
  ],
});
