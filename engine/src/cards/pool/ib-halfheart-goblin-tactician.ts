import { defineCard } from "../define.js";

// Duel Decks Anthology: Elves vs. Goblins (EVG). EDHREC rank 12867.
//
// The Goblin deals the damage as it last existed (rule 608.2h), to the
// creatures that were blocking it as it left. One that can't be sacrificed, or
// that someone else has taken by now (rule 701.21a), deals none.
const BLOCKED_TEXT =
  "Whenever another Goblin you control becomes blocked, sacrifice it. If you do, it deals 4 damage to each creature blocking it.";
const TOKENS_TEXT = "Sacrifice two Mountains: Create two 1/1 red Goblin creature tokens.";

export default defineCard({
  name: "Ib Halfheart, Goblin Tactician",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Goblin", "Advisor"],
  power: 3,
  toughness: 2,
  text: `${BLOCKED_TEXT}\n${TOKENS_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { subtype: "Goblin" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-target", target: "trigger-object" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed" },
            then: {
              kind: "damage-all",
              amount: 4,
              filter: { type: "creature", blockingRelation: { relation: "blocking", of: "trigger-object" } },
              from: "trigger-object",
            },
          },
        ],
      },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Mountain" }, count: 2 } },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 2 },
      resolve: null,
      text: TOKENS_TEXT,
    },
  ],
});
