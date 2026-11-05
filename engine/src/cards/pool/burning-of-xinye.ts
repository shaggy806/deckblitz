import { defineCard } from "../define.js";

// Each player chooses as it resolves and their four go at once, you first, then
// the target opponent; neither can choose an indestructible land (the rulings).
// With fewer than four to choose, every one of them. Other players' lands stay,
// and the damage reaches every creature.

const LANDS = { type: "land", controlledBy: "you", notKeyword: "indestructible" } as const;

export default defineCard({
  name: "Burning of Xinye",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "You destroy four lands you control, then target opponent destroys four lands they control. Then Burning of Xinye deals 4 damage to each creature.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: LANDS,
        min: 4,
        upTo: 4,
        then: { kind: "destroy", target: 0 },
        prompt: "Destroy four lands you control",
      },
      {
        kind: "choose-permanents",
        chooser: { target: 0 },
        filter: LANDS,
        min: 4,
        upTo: 4,
        then: { kind: "destroy", target: 0 },
        prompt: "Destroy four lands you control",
      },
      { kind: "damage-all", filter: { type: "creature" }, amount: 4 },
    ],
  },
});
