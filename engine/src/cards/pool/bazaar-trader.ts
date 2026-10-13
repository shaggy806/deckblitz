import { defineCard } from "../define.js";

// EDHREC rank 6987.
//
// Rulings:
//   [2010-03-01] If either the targeted player or the targeted permanent is an illegal target by
//     the time the ability resolves, the ability does nothing. The player won’t gain control of
//     the permanent.
//   [2010-03-01] You may target yourself with Bazaar Trader’s ability. Normally, this won’t have
//     any visible effect. However, the ability would override an effect with a limited duration
//     that gave you control of a permanent. For example, if you temporarily gained control of a
//     creature with Act of Treason, targeting yourself and that creature with Bazaar Trader’s
//     ability would then cause you to gain control of the creature indefinitely.
//   [2010-03-01] This effect has no duration. The targeted player retains control of the targeted
//     permanent until the game ends, the permanent leaves the battlefield, or an effect causes
//     someone else to gain control of it.
//
// Wrong Turn's control change with no duration; any player, yourself
// included (the second ruling).
const TEXT = "{T}: Target player gains control of target artifact, creature, or land you control.";

export default defineCard({
  name: "Bazaar Trader",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        "player",
        { kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature", "land"] } },
      ],
      effect: { kind: "gain-control", target: 1, who: { target: 0 }, untilEndOfTurn: false },
      resolve: null,
      text: TEXT,
    },
  ],
});
