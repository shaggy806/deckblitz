import { defineCard } from "../define.js";

// Fate Reforged (FRF). EDHREC rank 4168.
//
// A storage land (Calciform Pools' shape) whose X mana is Orb of Dragonkind's:
// any combination of colours, spent only on Dragon spells or abilities of
// Dragons on the battlefield (the ruling).
export default defineCard({
  name: "Crucible of the Spirit Dragon",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}, {T}: Put a storage counter on this land.\n{T}, Remove X storage counters from this land: Add X mana in any combination of colors. Spend this mana only to cast Dragon spells or activate abilities of Dragons.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "storage", amount: 1 },
      resolve: null,
      text: "{1}, {T}: Put a storage counter on this land.",
    },
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "storage", count: "x" } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: "x",
        spendOnly: {
          spell: { subtype: "Dragon" },
          abilityOf: { subtype: "Dragon" },
          text: "Spend this mana only to cast Dragon spells or activate abilities of Dragons.",
        },
      },
      resolve: null,
      text: "{T}, Remove X storage counters from this land: Add X mana in any combination of colors. Spend this mana only to cast Dragon spells or activate abilities of Dragons.",
    },
  ],
});
