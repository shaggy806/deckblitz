import { defineCard } from "../define.js";

// EDHREC rank 8666.
//
// Rulings:
//   [2013-07-01] If the creature type of a Sliver changes so it's no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.
//     However, for some abilities, like flying, having more than one instance of the ability
//     doesn't provide any additional benefit.
//   [2021-03-19] If multiple Slivers owned by one player would die at the same time, that player
//     chooses any of those Slivers and puts them on top of their library in any order. They don't
//     reveal this order.
//   [2021-03-19] The replacement effect that Pulmonic Sliver grants to all Slivers applies to
//     Pulmonic Sliver and any Slivers that would die at the same time as it.
//
// The granted replacement is optional (`optional`): each Sliver's controller
// as it would be put into a graveyard ("you", rule 109.5) is asked about all of
// theirs going at once, which go on top of their owner's library and in what
// order (rule 401.4 — an owner who isn't the controller arranges their own).
// "All Slivers": Sliver permanents of any type, not only creatures.

const FLYING = "All Sliver creatures have flying.";
const GRANTED = "If this permanent would be put into a graveyard, you may put it on top of its owner's library instead.";
const LIBRARY = `All Slivers have "${GRANTED}"`;

export default defineCard({
  name: "Pulmonic Sliver",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: `${FLYING}\n${LIBRARY}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["flying"],
      text: FLYING,
    },
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsStatic: [
        {
          affects: { scope: "self" },
          replacement: {
            event: "would-be-put-into-graveyard",
            instead: "library-top",
            self: true,
            from: "battlefield",
            optional: true,
          },
          text: GRANTED,
        },
      ],
      text: LIBRARY,
    },
  ],
});
