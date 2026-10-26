import { defineCard } from "../define.js";

export default defineCard({
  name: "Cyclical Evolution",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{2}{G}" },
  text: "Target creature gets +3/+3 until end of turn. Exile Cyclical Evolution with three time counters on it.\nSuspend 3—{2}{G} (Rather than cast this card from your hand, you may pay {2}{G} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});
