import { defineCard } from "../define.js";

// EDHREC rank 17610.
//
// Rulings:
//   [2022-04-29] The damage dealt by the target Phoenix as Syrix's first triggered ability
//     resolves is equal to its own power, not the power of the creature card that left the
//     graveyard this turn.
//   [2022-04-29] You must pay all costs for Syrix when you cast it using its last ability and you
//     must cast it as the ability resolves. You may not wait and cast it later in the turn (unless
//     of course the ability triggers and resolves again).
//   [2022-04-29] If Syrix dies at the same time as another Phoenix, its last ability won't
//     trigger. It must be in the graveyard already at the time that the other Phoenix dies.
//
// "A creature card left your graveyard" reads each card as it was there (the
// journal's `left-graveyard` entries), whatever it became where it went; the
// intervening if is asked as the end step begins and as it resolves (rule
// 603.4). Its last ability works only from the graveyard, so a Syrix dying
// beside another Phoenix isn't there yet to see it.

const END_TEXT =
  "At the beginning of each end step, if a creature card left your graveyard this turn, target Phoenix you control deals damage equal to its power to any target.";
const DIES_TEXT = "Whenever another Phoenix you control dies, you may cast this card from your graveyard.";

export default defineCard({
  name: "Syrix, Carrier of the Flame",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${END_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "left-graveyard", who: "you", filter: { type: "creature" } },
      targets: [{ kind: "permanent", filter: { subtype: "Phoenix", controlledBy: "you" } }, "any-target"],
      effect: { kind: "damage", amount: { powerOf: 0 }, target: 1, from: 0 },
      resolve: null,
      text: END_TEXT,
    },
    {
      fromGraveyard: true,
      trigger: { on: "dies", who: "you-control", otherOnly: true, filter: { subtype: "Phoenix" } },
      targets: [],
      effect: { kind: "cast-now", target: "source" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
