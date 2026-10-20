import { defineCard } from "../define.js";

// EDHREC rank 8675. X is the damage it dealt to that player — the trigger's
// value, read as the target is chosen.
const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, you may return target creature card with mana value X or less from your graveyard to the battlefield, where X is the amount of damage this creature dealt to that player.";

export default defineCard({
  name: "Venerable Warsinger",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            type: "creature",
            manaValue: { op: "lte", n: { amount: { triggerValue: true } } },
          },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return the targeted creature card to the battlefield?",
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
