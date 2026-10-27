import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 15439.
//
// Wave of Terror's mass destroy, its mana value read off this creature's
// +1/+1 counters as the trigger resolves; itself included (at three counters
// it destroys itself). Dredge is `CardDefinition.dredge` (Darkblast's).

const UPKEEP_TEXT = "At the beginning of your upkeep, put a +1/+1 counter on this creature.";
const END_TEXT =
  "At the beginning of your end step, destroy each creature with mana value equal to the number of +1/+1 counters on this creature.";

export default defineCard({
  name: "Necroplasm",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 1,
  dredge: 2,
  text: `${UPKEEP_TEXT}\n${END_TEXT}\nDredge 2 (If you would draw a card, you may mill two cards instead. If you do, return this card from your graveyard to your hand.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: {
          type: "creature",
          manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "+1/+1" } } },
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
