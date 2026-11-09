import { defineCard } from "../define.js";

const LOSES =
  "When enchanted player loses the game, you gain X life and draw X cards, where X is the number of spite counters on this Aura.";

// EDHREC rank 11271. The enchanted player leaving puts this Aura in the
// graveyard; X is its counters as it last existed (rule 608.2h).
export default defineCard({
  name: "Curse of Vengeance",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  targets: ["player"],
  text: `Enchant player\nWhenever enchanted player casts a spell, put a spite counter on this Aura.\n${LOSES}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "attached" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "spite", amount: 1 },
      resolve: null,
      text: "Whenever enchanted player casts a spell, put a spite counter on this Aura.",
    },
    {
      trigger: { on: "event", event: "loses-game", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: { countersOn: "source", counter: "spite" } },
          { kind: "draw", amount: { countersOn: "source", counter: "spite" } },
        ],
      },
      resolve: null,
      text: LOSES,
    },
  ],
});
