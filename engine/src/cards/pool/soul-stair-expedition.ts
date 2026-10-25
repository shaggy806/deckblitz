import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Zendikar (ZEN). EDHREC rank 18199. Khalni Heart Expedition's shape, with
// Fight On!'s "up to two target creature cards from your graveyard".

export default defineCard({
  name: "Soul Stair Expedition",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Landfall — Whenever a land you control enters, you may put a quest counter on this enchantment.\nRemove three quest counters from this enchantment and sacrifice it: Return up to two target creature cards from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Soul Stair Expedition?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you may put a quest counter on this enchantment.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "quest", count: 3 }, sacrifice: "self" },
      targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: 0, from: "graveyard" },
          { kind: "return-to-hand", target: 1, from: "graveyard" },
        ],
      },
      resolve: null,
      text: "Remove three quest counters from this enchantment and sacrifice it: Return up to two target creature cards from your graveyard to your hand.",
    },
  ],
});
