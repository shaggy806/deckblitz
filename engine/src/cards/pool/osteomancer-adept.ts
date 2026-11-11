import { defineCard } from "../define.js";
import { forageCost } from "../helpers.js";

// Forage is an additional cost of each cast this permission offers (`do`,
// offered only the ways that can be paid); a creature cast this way enters
// with a finality counter.
export default defineCard({
  name: "Osteomancer Adept",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: "Deathtouch\n{T}: Until end of turn, you may cast creature spells from your graveyard by foraging in addition to paying their other costs. If you cast a spell this way, that creature enters with a finality counter on it. (To forage, exile three cards from your graveyard or sacrifice a Food. If a creature with a finality counter on it would die, exile it instead.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        mayPlay: {
          from: "graveyard",
          filter: { type: "creature" },
          do: forageCost(),
          entersWith: { kind: "finality", amount: 1 },
        },
      },
      resolve: null,
      text: "{T}: Until end of turn, you may cast creature spells from your graveyard by foraging in addition to paying their other costs. If you cast a spell this way, that creature enters with a finality counter on it.",
    },
  ],
});
