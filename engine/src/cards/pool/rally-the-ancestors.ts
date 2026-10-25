import { defineCard } from "../define.js";

// EDHREC rank 11218. Fate Reforged.
//
// Every creature card with mana value X or less comes back at once
// (`count: "all"`, the filter reading the spell's X), and a delayed ability
// about those same permanents (`about`, Random Encounter's shape) exiles each
// still there at your next upkeep — one that left and came back in between is
// a new object it doesn't touch (rule 400.7).

export default defineCard({
  name: "Rally the Ancestors",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Return each creature card with mana value X or less from your graveyard to the battlefield. Exile those creatures at the beginning of your next upkeep. Exile Rally the Ancestors.",
  targets: [],
  exileOnResolve: true,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "return-from-graveyard",
        filter: { type: "creature", manaValue: { op: "lte", n: "x" } },
        destination: "battlefield",
        count: "all",
      },
      {
        kind: "delayed-trigger",
        at: "your-next-upkeep",
        about: "put-onto-battlefield",
        effect: {
          kind: "for-each-target",
          from: 0,
          effect: { kind: "exile", target: 0 },
          simultaneous: true,
        },
        text: "Exile those creatures.",
      },
    ],
  },
});
