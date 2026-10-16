import { defineCard } from "../define.js";

// Rulings:
//   [2024-07-26] A permanent with an ability that triggers whenever you "expend N" will see mana
//     you spent to cast spells the turn it enters, including mana you spent before it entered.
//   [2024-07-26] Abilities that trigger whenever you "expend N" only trigger when you reach that
//     specific amount of mana spent on casting spells that turn. This can only happen once per turn.

const MANA_TEXT = "{T}: Add one mana of any color.";
const EXPEND_TEXT = "Whenever you expend 8, return up to one target permanent card from your graveyard to your hand.";

export default defineCard({
  name: "Trailtracker Scout",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Raccoon", "Scout"],
  power: 1,
  toughness: 3,
  text: `${MANA_TEXT}\n${EXPEND_TEXT} (You expend 8 as you spend your eighth total mana to cast spells during a turn.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "expend", who: "you", amount: 8 },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: EXPEND_TEXT,
    },
  ],
});
