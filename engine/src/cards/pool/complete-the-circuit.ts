import { defineCard } from "../define.js";

// EDHREC rank 9082. Alchemist's Refuge's flash for sorceries, Summon: G.F.
// Cerberus's next-spell copies.

const COPY_TEXT = "When you next cast an instant or sorcery spell this turn, copy that spell twice. You may choose new targets for the copies.";

export default defineCard({
  name: "Complete the Circuit",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["instant"],
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nYou may cast sorcery spells this turn as though they had flash.\n${COPY_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "player-effect", duration: "end-of-turn", castAsThoughFlash: { filter: { type: "sorcery" } } },
      {
        kind: "delayed-trigger",
        at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: 2 },
        text: COPY_TEXT,
      },
    ],
  },
});
