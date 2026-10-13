import { defineCard } from "../define.js";

// EDHREC rank 1439.
//
// "That hasn't been chosen" is this Hallcreeper's own memory: one that leaves
// and returns starts afresh (the ruling, rule 400.7). The mode is announced
// as the ability goes on the stack (rule 603.3c), so the copy mode needs
// another creature you control to target. Becoming a copy has no duration
// (rule 611.2a); it copies the target's copiable values — what it copies, if
// it's a copy; a token's as made — keeps its own counters and status (rule
// 707.4), and has none of its old abilities, this one included.
const UNBLOCKABLE_TEXT = "This creature can't be blocked.";
const TRIGGER_TEXT = "Whenever this creature deals combat damage to a player, choose one that hasn't been chosen —";
const COUNTER_MODE = "Put two +1/+1 counters on this creature.";
const DRAW_MODE = "Draw a card.";
const COPY_MODE = "This creature becomes a copy of another target creature you control.";

export default defineCard({
  name: "Silent Hallcreeper",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Horror"],
  power: 1,
  toughness: 1,
  text: `${UNBLOCKABLE_TEXT}\n${TRIGGER_TEXT}\n• ${COUNTER_MODE}\n• ${DRAW_MODE}\n• ${COPY_MODE}`,
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: UNBLOCKABLE_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenBefore: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: COUNTER_MODE, effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 } },
          { text: DRAW_MODE, effect: { kind: "draw", amount: 1 } },
          {
            text: COPY_MODE,
            targets: [{ kind: "other", of: "creature-you-control" }],
            effect: { kind: "become-copy", target: "source", of: 0 },
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${COUNTER_MODE} ${DRAW_MODE} ${COPY_MODE}`,
    },
  ],
});
