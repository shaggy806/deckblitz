import { defineCard } from "../define.js";

// EDHREC rank 11716. Final Fantasy (FIC).
//
// The combat-damage trigger is Contaminant Grafter's batch (once per damage
// event, however many creatures and players); with a full party as it
// resolves it draws three and discards nothing (the ruling).

const ACTIVATED_TEXT = "{U}, {T}: Another target creature you control can't be blocked this turn.";
const DAMAGE_TEXT =
  "Whenever one or more creatures you control deal combat damage to one or more players, draw a card, then discard a card. If you have a full party, instead draw three cards.";

export default defineCard({
  name: "The Destined Thief",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: `The Destined Thief can't be blocked.\n${ACTIVATED_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "The Destined Thief can't be blocked.",
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature" },
        to: "player",
        combat: true,
        once: "per-event",
      },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "full-party" },
        then: { kind: "draw", amount: 3 },
        else: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "discard", target: "you", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
