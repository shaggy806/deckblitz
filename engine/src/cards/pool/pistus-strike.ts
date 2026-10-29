import { defineCard } from "../define.js";

// Mirrodin Besieged. The creature's controller is read as it last existed on
// the battlefield (rule 608.2h).

const TEXT = "Destroy target creature with flying. Its controller gets a poison counter.";

export default defineCard({
  name: "Pistus Strike",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "add-player-counters", counter: "poison", who: { controllerOfTarget: 0 }, amount: 1 },
    ],
  },
});
