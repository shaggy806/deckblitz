import { defineCard } from "../define.js";

// EDHREC rank 2639. The first ability is Shelob, Dread Weaver's dies trigger with Etrata's
// `withCounters` hit counter (any creature, tokens too: a token in exile has ceased to exist). The
// granted trigger is Sanctuary Warden's "you may remove a counter … If you do": `remove-counters`
// with `inExile` over the cards the damaged player (`"that-player"` is the trigger's player)
// owns in exile, and the draw and Treasures on `this-way` "counters-removed".

const DIES_TEXT = "Whenever a creature an opponent controls dies, exile it with a hit counter on it.";
const GRANTED_TEXT =
  "Whenever this creature deals combat damage to a player, you may remove a hit counter from a card that player owns in exile. If you do, draw a card and create two Treasure tokens.";
const GRANT_TEXT = `Assassins, Mercenaries, and Rogues you control have deathtouch and "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Mari, the Killing Quill",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Vampire", "Assassin"],
  power: 3,
  toughness: 2,
  text: `${DIES_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", withCounters: { kind: "hit", amount: 1 } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { controlledBy: "you", anyOf: [{ subtype: "Assassin" }, { subtype: "Mercenary" }, { subtype: "Rogue" }] },
      },
      grantKeywords: ["deathtouch"],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Remove a hit counter from a card that player owns in exile?",
            effect: {
              kind: "sequence",
              effects: [
                {
                  kind: "remove-counters",
                  inExile: true,
                  from: { ownedByRef: "trigger-player" },
                  counter: "hit",
                  count: 1,
                },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "counters-removed" },
                  then: {
                    kind: "sequence",
                    effects: [
                      { kind: "draw", amount: 1 },
                      { kind: "create-token", token: "Treasure Token", count: 2 },
                    ],
                  },
                },
              ],
            },
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
