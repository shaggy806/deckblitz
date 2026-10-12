import { defineCard } from "../define.js";

// EDHREC rank 3736.
//
// "Then if it has four or more quest counters on it" is read as the ability
// resolves, after the counter goes on — as it last existed if the enchantment
// has left (rule 608.2h), when no counter could be put on it.

const DAMAGE_TEXT =
  "Whenever a creature you control deals combat damage to a player, put a quest counter on this enchantment. Then if it has four or more quest counters on it, draw a card.";
const BEND_TEXT = "Waterbend {4}: Target creature can't be blocked this turn.";

export default defineCard({
  name: "Waterbender Ascension",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${DAMAGE_TEXT}\n${BEND_TEXT} (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "quest", compare: { op: "gte", n: 4 } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false, waterbend: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: BEND_TEXT,
    },
  ],
});
