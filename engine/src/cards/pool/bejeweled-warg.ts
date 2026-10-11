import { defineCard } from "../define.js";

// EDHREC rank 13860. A modal triggered ability: the mode is chosen as it's
// put on the stack, before its target (rules 603.3c, 700.2b) — Grenzo,
// Havoc Raiser's `announced` shape. "Target Wolf you control" is any Wolf
// permanent of yours, this one included.

const TRIGGER_TEXT = "Whenever this creature deals combat damage to a player, choose one —";
const COUNTER_MODE = "• Put a +1/+1 counter on target Wolf you control.";
const TREASURE_MODE =
  '• Create a Treasure token. (It\'s an artifact with "{T}, Sacrifice this token: Add one mana of any color.")';

export default defineCard({
  name: "Bejeweled Warg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER_TEXT}\n${COUNTER_MODE}\n${TREASURE_MODE}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: COUNTER_MODE,
            targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Wolf" } }],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          {
            text: TREASURE_MODE,
            effect: { kind: "create-token", token: "Treasure Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${COUNTER_MODE} ${TREASURE_MODE}`,
    },
  ],
});
