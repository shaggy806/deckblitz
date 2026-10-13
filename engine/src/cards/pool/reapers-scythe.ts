import { defineCard } from "../define.js";

// EDHREC rank 6921.
// Makes Hero → use "Hero Token (Black Mage's Rod)".
//
// Rulings:
//   [2025-06-06] If the Hero token is destroyed, the Equipment stays on the battlefield.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//   [2025-06-06] The Hero token enters as a 1/1 creature, then the Equipment becomes attached to
//     it. Abilities that trigger when a creature enters the battlefield see that a 1/1 creature
//     entered the battlefield.
//   [2025-06-06] You may pay the Equipment's equip cost as normal to move it from the Hero token
//     to another creature you control.

export default defineCard({
  name: "Reaper's Scythe",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Job select\nAt the beginning of your end step, put a soul counter on this Equipment for each player who lost life this turn.\nEquipped creature gets +1/+1 for each soul counter on this Equipment and is an Assassin in addition to its other types.\nDeath Sickle — Equip {2}",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Death Sickle — Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      // Job select — Samurai's Katana's shape: the Hero enters, then the
      // Equipment is attached to it (one of them, with two made).
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: "Job select",
    },
    {
      // Every player who lost life, you included (Strefan's count).
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "soul",
        amount: { playersWithTurnStat: "life-lost", who: "each-player" },
      },
      resolve: null,
      text: "At the beginning of your end step, put a soul counter on this Equipment for each player who lost life this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { countersOnSource: "soul", pt: [1, 1] },
      addSubtypes: ["Assassin"],
      text: "Equipped creature gets +1/+1 for each soul counter on this Equipment and is an Assassin in addition to its other types.",
    },
  ],
});
