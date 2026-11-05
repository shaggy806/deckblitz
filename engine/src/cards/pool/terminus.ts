import { defineCard } from "../define.js";

// EDHREC rank 5076.

export default defineCard({
  name: "Terminus",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  miracle: { cost: "{W}" },
  text: "Put all creatures on the bottom of their owners' libraries.\nMiracle {W} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  effect: { kind: "put-on-libraries", what: { all: { type: "creature" } }, position: "bottom" },
});
