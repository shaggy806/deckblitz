import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 19897.
//
// The attack trigger's "if its power is 10 or greater" ends the sentence, so
// it is no intervening-if: the trigger always goes on the stack and the power
// is read as it resolves.

const CAST = "Whenever you cast a spell, you may put two +1/+1 counters on this creature.";
const ATTACK = "Whenever this creature attacks, it gains trample until end of turn if its power is 10 or greater.";

export default defineCard({
  name: "Witch-Maw Nephilim",
  manaCost: "{G}{W}{U}{B}",
  colors: ["W", "U", "B", "G"],
  types: ["creature"],
  subtypes: ["Nephilim"],
  power: 1,
  toughness: 1,
  text: `${CAST}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put two +1/+1 counters on Witch-Maw Nephilim?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: CAST,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { power: { op: "gte", n: 10 } } },
        then: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
