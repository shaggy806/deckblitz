import { defineCard } from "../define.js";

// EDHREC rank 3372.
// Rulings:
//   [2017-02-09] The affected player may still activate abilities, play lands, and cast
//     creature spells.
//   [2017-02-09] The target player (and any other player) may cast spells in response to the
//     activated ability of Hope of Ghirapur. The ability won't affect those spells.
//   [2017-02-09] If you skip your turn, the affected player will be unable to cast noncreature
//     spells until you actually start a turn.
//
// "Who was dealt combat damage by Hope of Ghirapur this turn" is read off the
// journal for the Hope that was sacrificed, in the stint it left from (rule
// 400.7), as the target is chosen and again as the ability resolves (608.2b).

const TEXT =
  "Sacrifice Hope of Ghirapur: Until your next turn, target player who was dealt combat damage by Hope of Ghirapur this turn can't cast noncreature spells.";

export default defineCard({
  name: "Hope of Ghirapur",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  supertypes: ["legendary"],
  subtypes: ["Thopter"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "player-dealt-combat-damage-by-source" }],
      effect: {
        kind: "prohibit",
        prohibits: [{ act: "cast", who: { target: 0 }, filter: { notTypes: ["creature"] } }],
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
