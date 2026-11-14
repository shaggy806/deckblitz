import { defineCard } from "../define.js";

// Rulings:
//   For the last ability, it doesn't matter how many pips the die you rolled a 6 on had, whether
//     that was a six-sided die or a d20. As long as you rolled a 6 on any die that turn, you may
//     cast Eelectrocute from your graveyard.
//   If you cast Eelectrocute from your graveyard, you still pay its costs.
//   If you cast Eelectrocute from your graveyard using another permission, you won't exile it
//     instead (unless that permission also states that you exile it).

const DAMAGE_TEXT = "Eelectrocute deals 2 damage to any target.";
const GRAVEYARD_TEXT =
  "You may cast this card from your graveyard as long as you've rolled a 6 this turn. If you cast it this way and it would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Eelectrocute",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `${DAMAGE_TEXT}\n${GRAVEYARD_TEXT}`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  // A 6 on any kind of die, its modifier included (rule 706.2), asked as
  // it's cast; for its normal cost, at an instant's timing.
  mayPlaySelf: {
    from: ["graveyard"],
    if: { kind: "dice-rolled-this-turn", die: { atLeast: 6, atMost: 6 } },
    exileAfter: true,
  },
});
