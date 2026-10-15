import { defineCard } from "../define.js";

// EDHREC rank 19312.
//
// Rulings:
//   [2025-04-04] You don't choose a target for Yathan Roadwatcher's ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you mill four cards this way.
//     You choose a target for that ability as it goes on the stack. Each player may respond to
//     this triggered ability as normal.
//
// "If you cast it" is an intervening-if (rule 603.4) on the permanent having
// been cast (Skitterbeam Battalion's shape). "When you do" is Primal
// Witchstalker's reflexive trigger, only once all four cards were milled, its
// target chosen with the milled cards already in the graveyard.

const TEXT =
  "When this creature enters, if you cast it, mill four cards. When you do, return target creature card with mana value 3 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Yathan Roadwatcher",
  manaCost: "{1}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", atLeast: 4 },
            then: {
              kind: "reflexive-trigger",
              targets: [
                {
                  kind: "card-in-graveyard",
                  whose: "you",
                  filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
                },
              ],
              effect: { kind: "put-onto-battlefield", target: 0 },
              text: "When you do, return target creature card with mana value 3 or less from your graveyard to the battlefield.",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
