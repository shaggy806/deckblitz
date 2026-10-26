import { defineCard } from "../define.js";

export default defineCard({
  name: "Festering March",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{2}{B}" },
  text: "Creatures your opponents control get -1/-1 until end of turn. Exile Festering March with three time counters on it.\nSuspend 3—{2}{B} (Rather than cast this card from your hand, you may pay {2}{B} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});
