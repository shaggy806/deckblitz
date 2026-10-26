import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 19971.

export default defineCard({
  name: "Morselhoarder",
  manaCost: "{4}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 4,
  text: "This creature enters with two -1/-1 counters on it.\nRemove a -1/-1 counter from this creature: Add one mana of any color.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "-1/-1", count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "Remove a -1/-1 counter from this creature: Add one mana of any color.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: "This creature enters with two -1/-1 counters on it.",
    },
  ],
});
