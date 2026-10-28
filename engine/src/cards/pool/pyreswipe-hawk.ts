import { defineCard } from "../define.js";

// EDHREC rank 9345. The attack trigger is Orcish Siegemaster's shape over
// artifacts' mana values; the steal is Master Thief's, with an optional slot.
//
// Rulings:
//   [2024-07-26] If Pyreswipe Hawk leaves the battlefield before its last ability resolves,
//     control of the target artifact won't change at all.
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per
//     turn.

const ATTACK_TEXT =
  "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the greatest mana value among artifacts you control.";
const EXPEND_TEXT =
  "Whenever you expend 6, gain control of up to one target artifact for as long as you control this creature. (You expend 6 as you spend your sixth total mana to cast spells during a turn.)";

export default defineCard({
  name: "Pyreswipe Hawk",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Bird"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ATTACK_TEXT}\n${EXPEND_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { aggregate: "max", of: "mana-value", filter: { type: "artifact", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "expend", who: "you", amount: 6 },
      targets: [{ kind: "optional", of: "artifact" }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileYouControlSource: true },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});
