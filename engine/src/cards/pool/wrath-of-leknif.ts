import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Which lands to untap, up to four, is
// chosen as it resolves, after the creatures are destroyed.
export default defineCard({
  name: "Wrath of Leknif",
  manaCost: "{1}{W}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Destroy all creatures. They can't be regenerated. Untap up to four lands you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "creature" }, cantBeRegenerated: true },
      {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        upTo: 4,
        then: { kind: "untap", target: 0 },
        prompt: "Untap up to four lands you control",
      },
    ],
  },
});
