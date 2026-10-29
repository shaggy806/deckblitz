import { defineCard } from "../define.js";

// EDHREC rank 9811.
// Makes Saproling → use "Saproling Token".

export default defineCard({
  name: "Ghave, Guru of Spores",
  manaCost: "{2}{W}{B}{G}",
  colors: ["W", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fungus", "Shaman"],
  power: 0,
  toughness: 0,
  text: "Ghave enters with five +1/+1 counters on it.\n{1}, Remove a +1/+1 counter from a creature you control: Create a 1/1 green Saproling creature token.\n{1}, Sacrifice a creature: Put a +1/+1 counter on target creature.",
  activated: [
    {
      // Which creature gives the counter is chosen as the cost is paid.
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "+1/+1", count: 1, from: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: "{1}, Remove a +1/+1 counter from a creature you control: Create a 1/1 green Saproling creature token.",
    },
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice a creature: Put a +1/+1 counter on target creature.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 5 } },
      text: "Ghave enters with five +1/+1 counters on it.",
    },
  ],
});
