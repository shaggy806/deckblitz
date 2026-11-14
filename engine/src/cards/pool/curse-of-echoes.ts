import { defineCard } from "../define.js";

// EDHREC rank 10054. Each other player is asked in turn from the active
// player (the rulings), each copy theirs to retarget; the copies go on the
// stack in turn order, so the last one made resolves first.

const TEXT =
  "Whenever enchanted player casts an instant or sorcery spell, each other player may copy that spell and may choose new targets for the copy they control.";

export default defineCard({
  name: "Curse of Echoes",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  targets: ["player"],
  text: `Enchant player\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "attached", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: { otherThan: "trigger-controller" },
        prompt: "Copy that spell? (You may choose new targets for the copy.)",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
