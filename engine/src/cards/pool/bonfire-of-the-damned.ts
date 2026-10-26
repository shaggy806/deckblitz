import { defineCard } from "../define.js";

// EDHREC rank 11416.

export default defineCard({
  name: "Bonfire of the Damned",
  manaCost: "{X}{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Bonfire of the Damned deals X damage to target player or planeswalker and each creature that player or that planeswalker's controller controls.\nMiracle {X}{R} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  miracle: { cost: "{X}{R}" },
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "damage-all", filter: { type: "creature" }, amount: "x", controlledByTarget: 0 },
    ],
  },
});
