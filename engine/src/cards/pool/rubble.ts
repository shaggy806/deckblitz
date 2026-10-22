import { defineCard } from "../define.js";

const FACES = ["Reduce // Rubble", "Reduce", "Rubble"];

export default defineCard({
  name: "Rubble",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nUp to three target lands don't untap during their controller's next untap step.",
  targets: [
    { kind: "optional", of: "land" },
    { kind: "optional", of: { kind: "other", of: "land", than: { slots: [0] } } },
    { kind: "optional", of: { kind: "other", of: "land", than: { slots: [0, 1] } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      { kind: "tap", target: 1, doesntUntapNext: true, onlyDoesntUntap: true },
      { kind: "tap", target: 2, doesntUntapNext: true, onlyDoesntUntap: true },
    ],
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
