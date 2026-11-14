import { defineCard } from "../define.js";

// EDHREC rank 10416. "Enchanted player's upkeep" is a `step-begins` trigger
// with `who: "attached"`; "that player" is the player it triggered for
// (`"trigger-player"`, the player this Curse enchanted as it triggered), whom
// the "any number of target players" group can't name. This Curse's
// controller chooses the targets wherever it's attached (the ruling). Each
// draws the number of Curses attached to that player, counted as the ability
// resolves (`attachedToPlayerRef`, this Curse among them while it's still
// attached — rule 303.4).

const TEXT =
  "At the beginning of enchanted player's upkeep, any number of target players other than that player each draw cards equal to the number of Curses attached to that player.";

export default defineCard({
  name: "Curse of Surveillance",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "attached" },
      targets: [{ kind: "any-number", of: { kind: "other", of: "player", than: "trigger-player" } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "draw",
          target: 0,
          amount: { countOf: { subtype: "Curse", attachedToPlayerRef: "trigger-player" } },
        },
        simultaneous: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
