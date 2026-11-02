import { defineCard } from "../define.js";

// "Attacking alone" is now: it's attacking and no other creature is (rule 506.5),
// so one that started with company is alone once the others leave combat. Only one
// player attacks at a time, so its controller's attackers are all of them.

const ALONE_TEXT = "As long as enchanted creature is attacking alone, it can't be blocked.";
const CONNIVE_TEXT = "Whenever this creature deals combat damage to a player, it connives.";

export default defineCard({
  name: "Security Bypass",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature"],
  text: `Enchant creature\n${ALONE_TEXT}\nEnchanted creature has "${CONNIVE_TEXT}" (Its controller draws a card, then discards a card. If they discarded a nonland card, they put a +1/+1 counter on this creature.)`,
  static: [
    {
      affects: { scope: "attached" },
      condition: {
        kind: "all",
        of: [
          { kind: "source", filter: { attachedTo: { attacking: true } } },
          {
            kind: "of-player",
            player: "host-controller",
            condition: { kind: "not", of: { kind: "controls", filter: { attacking: true }, atLeast: 2 } },
          },
        ],
      },
      restrictions: ["cant-be-blocked"],
      text: ALONE_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "connive", target: "source" },
          resolve: null,
          text: CONNIVE_TEXT,
        },
      ],
      text: `Enchanted creature has "${CONNIVE_TEXT}"`,
    },
  ],
});
