import { defineCard } from "../define.js";

// EDHREC rank 11325.
//
// Rulings:
//   You can activate one loyalty ability of each planeswalker you control during each of your
//     turns, whether that ability is one it always has or the one it gains because of Elspeth's
//     Talent.
//   The last ability resolves before the loyalty ability that caused it to trigger: tokens that
//     ability makes aren't there yet to get +2/+2 and vigilance.
//   The creatures affected are those you control as it resolves.
//
// The pump trigger is the host's loyalty ability activated by this Aura's
// controller (`who: "attached"`, `loyalty`, `activator: "you"`), as Rowan's
// Talent's copy is: one of an opponent's planeswalker it enchants isn't theirs.

const GRANTED = "+1: Create three 1/1 white Soldier creature tokens.";
const PUMP =
  "Whenever you activate a loyalty ability of enchanted planeswalker, creatures you control get +2/+2 and gain vigilance until end of turn.";

export default defineCard({
  name: "Elspeth's Talent",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant planeswalker\nEnchanted planeswalker has "[+1]: Create three 1/1 white Soldier creature tokens."\n${PUMP}`,
  targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          loyaltyCost: 1,
          cost: { tap: false, mana: null },
          targets: [],
          effect: { kind: "create-token", token: "Soldier Token", count: 3 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted planeswalker has "[+1]: Create three 1/1 white Soldier creature tokens."`,
    },
  ],
  triggered: [
    {
      trigger: { on: "activates-ability", who: "attached", loyalty: true, activator: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP,
    },
  ],
});
