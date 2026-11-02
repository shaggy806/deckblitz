import { defineCard } from "../define.js";

// Rulings:
//   [2014-11-24] You'll choose how each creature controlled by an opponent
//     blocks, even if that creature wasn't on the battlefield or wasn't
//     controlled by an opponent as the activated ability resolved.
//   [2014-11-24] With two of them, the controller of the last ability to resolve
//     chooses for the players who didn't resolve it (`blockChooser`).
//   [2014-11-24] The defending player is determined relative to the creature
//     that attacked.
export default defineCard({
  name: "Brutal Hordechief",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Whenever a creature you control attacks, defending player loses 1 life and you gain 1 life.\n{3}{R/W}{R/W}: Creatures your opponents control block this turn if able, and you choose how those creatures block.",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", who: "trigger-player", amount: 1 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever a creature you control attacks, defending player loses 1 life and you gain 1 life.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{R/W}{R/W}", tap: false },
      targets: [],
      effect: { kind: "choose-combat", blocks: "opponents", blockIfAble: true },
      resolve: null,
      text: "{3}{R/W}{R/W}: Creatures your opponents control block this turn if able, and you choose how those creatures block.",
    },
  ],
});
