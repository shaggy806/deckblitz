import { defineCard } from "../define.js";

// EDHREC rank 13114.
//
// The target's power is compared with The Master's as the ability is
// activated and again as it resolves (the target filter's `{ amount }`
// operand is re-read on the recheck — rule 608.2b). The trigger is Edric's
// shape, once per creature: any creature with skulk as it deals the damage,
// whoever controls it, dealing combat damage to one of your opponents.

const TAP_TEXT =
  "{T}: Target creature an opponent controls with power less than or equal to The Master's power gains skulk until end of turn. Goad it.";
const DAMAGE_TEXT =
  "Whenever a creature with skulk deals combat damage to one of your opponents, put a +1/+1 counter on The Master and draw a card.";

export default defineCard({
  name: "The Master, Mesmerist",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${TAP_TEXT} (A creature with skulk can't be blocked by creatures with greater power.)\n${DAMAGE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", power: { op: "lte", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "skulk", duration: "end-of-turn" },
          { kind: "goad", target: 0 },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "any",
        filter: { type: "creature", keyword: "skulk" },
        toOpponent: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
