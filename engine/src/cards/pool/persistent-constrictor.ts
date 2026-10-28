import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

export default defineCard({
  name: "Persistent Constrictor",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Snake"],
  power: 5,
  toughness: 3,
  text: "At the beginning of each opponent's upkeep, they lose 1 life and you put a -1/-1 counter on up to one target creature they control.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      // "They" is the opponent whose upkeep it is: the active player.
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature", controlledBy: "active-player" } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "active-player" },
          { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
        ],
      },
      resolve: null,
      text: "At the beginning of each opponent's upkeep, they lose 1 life and you put a -1/-1 counter on up to one target creature they control.",
    },
    persist(),
  ],
});
