import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever one or more creatures deal combat damage to you, each opponent sacrifices a creature of their choice that dealt combat damage to you this turn. The Ring tempts you.";
const ACTIVATED_TEXT = "Discard a card: Witch-king of Angmar gains indestructible until end of turn. Tap him.";

export default defineCard({
  name: "Witch-king of Angmar",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Wraith", "Noble"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}\n${ACTIVATED_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", filter: { type: "creature" }, to: "you", combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sacrifice",
            who: "each-opponent",
            filter: { type: "creature", dealtDamageThisTurn: { to: "you", combat: true } },
            count: 1,
          },
          { kind: "the-ring-tempts-you" },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
