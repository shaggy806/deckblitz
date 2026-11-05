import { defineCard } from "../define.js";

// EDHREC rank 15016. The trigger stays the Curse's controller's; the attacking
// player (the active player, as Curse of Shallow Graves says) chooses its target
// as it goes on the stack and, as it resolves, whether to tap or untap it.

const ATTACK_TEXT =
  "Whenever a player attacks enchanted player with one or more creatures, that attacking player may tap or untap target permanent of their choice.";

export default defineCard({
  name: "Curse of Inertia",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${ATTACK_TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "attached" },
      targetsChosenBy: "active-player",
      targets: ["permanent"],
      effect: {
        kind: "as-player",
        who: "active-player",
        effect: {
          kind: "modal",
          minModes: 0,
          maxModes: 1,
          modes: [
            { text: "Tap target permanent.", effect: { kind: "tap", target: 0 } },
            { text: "Untap target permanent.", effect: { kind: "untap", target: 0 } },
          ],
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
