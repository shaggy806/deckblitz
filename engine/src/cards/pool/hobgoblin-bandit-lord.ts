import { defineCard } from "../define.js";

// EDHREC rank 3677.
//
// Rulings:
//   Hobgoblin Bandit Lord's activated ability only counts the number of Goblins that entered the
//   battlefield this turn. It doesn't matter if those Goblins are still on the battlefield as it
//   resolves.
//   If no Goblins have entered the battlefield this turn, no damage will be dealt. Abilities that
//   trigger whenever damage is dealt won't trigger.

export default defineCard({
  name: "Hobgoblin Bandit Lord",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 3,
  text: "Other Goblins you control get +1/+1.\n{R}, {T}: This creature deals damage equal to the number of Goblins that entered the battlefield under your control this turn to any target.",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Goblin", controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: "Other Goblins you control get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["any-target"],
      effect: {
        kind: "damage",
        amount: { turnHistory: "entered", filter: { subtype: "Goblin" } },
        target: 0,
      },
      resolve: null,
      text: "{R}, {T}: This creature deals damage equal to the number of Goblins that entered the battlefield under your control this turn to any target.",
    },
  ],
});
