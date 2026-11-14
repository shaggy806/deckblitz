import { defineCard } from "../define.js";

// EDHREC rank 10727. "Enchanted player's upkeep" is a `step-begins` trigger
// with `who: "attached"`; "that player" / "them" is the player it triggered
// for (`"trigger-player"`, the player this Curse enchanted as it triggered).
// The Curses attached to them are counted as the ability resolves (the
// ruling): `attachedToPlayerRef`, this Curse among them while it's still
// attached (rule 303.4).

const TEXT =
  "At the beginning of enchanted player's upkeep, this Aura deals damage to that player equal to the number of Curses attached to them.";

export default defineCard({
  name: "Curse of Thirst",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [],
      effect: {
        kind: "damage",
        who: "trigger-player",
        amount: { countOf: { subtype: "Curse", attachedToPlayerRef: "trigger-player" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
