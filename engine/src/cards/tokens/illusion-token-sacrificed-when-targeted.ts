import { defineCard } from "../define.js";

// A 2/2 blue Illusion sacrificed when a spell targets it — Jace, Cunning
// Castaway's −2. Its trigger resolves first, so a spell with no other
// target is then countered for having none legal (the ruling).
const TEXT = "When this token becomes the target of a spell, sacrifice it.";

export default defineCard({
  name: "Illusion Token (Sacrificed When Targeted)",
  art: "a10729a5-061a-4daf-91d6-0f6ce813a992",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
