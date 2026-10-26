import { defineCard } from "../define.js";

// EDHREC rank 20283.

export default defineCard({
  name: "Blessings of Nature",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Distribute four +1/+1 counters among any number of target creatures.\nMiracle {G} (You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn.)",
  miracle: { cost: "{G}" },
  targets: [{ kind: "any-number", of: "creature", min: 1, max: 4 }],
  divided: { total: 4, slot: 0, of: "+1/+1 counters" },
  effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
});
