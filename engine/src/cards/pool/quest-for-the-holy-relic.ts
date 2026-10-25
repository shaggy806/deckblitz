import { defineCard } from "../define.js";

// EDHREC rank 16653.
//
// Rulings: the creature isn't targeted — it's chosen once the Equipment is on
// the battlefield (a shroud creature can be chosen); with no creature (or none
// it can equip) the Equipment just stays unattached. So: the search, then a
// non-targeted choice of a creature you control, then the found Equipment (the
// one put onto the battlefield this way) attached to it.

const CAST_TEXT = "Whenever you cast a creature spell, you may put a quest counter on this enchantment.";
const QUEST_TEXT =
  "Remove five quest counters from this enchantment and sacrifice it: Search your library for an Equipment card, put it onto the battlefield, attach it to a creature you control, then shuffle.";

export default defineCard({
  name: "Quest for the Holy Relic",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${CAST_TEXT}\n${QUEST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a quest counter on Quest for the Holy Relic?",
        effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "quest", count: 5 }, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "search-library", filter: { subtype: "Equipment" }, destination: "battlefield", min: 0, max: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", atLeast: 1 },
            then: {
              kind: "choose-permanents",
              filter: { type: "creature", controlledBy: "you" },
              min: 1,
              upTo: 1,
              prompt: "Choose a creature you control to attach the Equipment to",
              then: {
                kind: "attach",
                target: 0,
                attachments: { subtype: "Equipment", thisWay: "put-onto-battlefield" },
              },
            },
          },
        ],
      },
      resolve: null,
      text: QUEST_TEXT,
    },
  ],
});
