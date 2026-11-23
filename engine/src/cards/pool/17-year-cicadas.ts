import { defineCard } from "../define.js";

// Playtest card. Its resolution exiles it with seventeen time counters
// (`give-suspend` on its own spell, as Rousing Refrain); it has suspend
// printed, so it is suspended again (rule 702.62b).

const CAST_TEXT = "Whenever you cast a spell, if this card is suspended, remove a time counter from it.";

export default defineCard({
  name: "17-Year Cicadas",
  manaCost: "{7}{W}",
  colors: ["W"],
  types: ["sorcery"],
  suspend: { n: 17, cost: "{0}" },
  text: `Create ten 1/1 white Insect creature tokens with flying. Exile 17-Year Cicadas with seventeen time counters on it.\nSuspend 17 — {0} (Rather than cast this card from your hand, you may pay {0} and exile it with seventeen time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)\n${CAST_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "White Insect Token (Flying)", count: 10 },
      { kind: "give-suspend", target: "source", timeCounters: 17 },
    ],
  },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      whileSuspended: true,
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
