import { defineCard } from "../define.js";

export default defineCard({
  name: "Suspended Sentence",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  suspend: { n: 3, cost: "{1}{B}" },
  text: "Destroy target creature an opponent controls. That player loses 3 life. Exile Suspended Sentence with three time counters on it.\nSuspend 3—{1}{B} (Rather than cast this card from your hand, you may pay {1}{B} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "lose-life", amount: 3, toControllerOfTarget: 0 },
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});
