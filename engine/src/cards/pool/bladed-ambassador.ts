import { defineCard } from "../define.js";

// EDHREC rank 21399.

export default defineCard({
  name: "Bladed Ambassador",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Soldier"],
  power: 3,
  toughness: 1,
  text: "This creature enters with an oil counter on it.\n{1}, Remove an oil counter from this creature: This creature gains indestructible until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, removeCounter: { kind: "oil", count: 1 } },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}, Remove an oil counter from this creature: This creature gains indestructible until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 1 } },
      text: "This creature enters with an oil counter on it.",
    },
  ],
});
