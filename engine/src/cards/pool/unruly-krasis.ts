import { defineCard } from "../define.js";

// EDHREC rank 22301.
//
// "You may have the base power and toughness … become X/X": an `animate` of
// the target that adds no types (Fractalize's shape — layer 7b only, so
// counters and pumps still apply on top, the ruling), behind a `may`. X is
// this creature's power read once as the ability resolves (the ruling; as it
// last existed if it has left). Adapt is Zegana's shape.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may have the base power and toughness of another target creature you control become X/X until end of turn, where X is this creature's power.";
const ADAPT_TEXT = "{3}{G}{U}: Adapt 3. (If this creature has no +1/+1 counters on it, put three +1/+1 counters on it.)";

export default defineCard({
  name: "Unruly Krasis",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Shark", "Octopus", "Lizard"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}\n${ADAPT_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
      },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "may",
        prompt: "Have its base power and toughness become X/X, where X is this creature's power?",
        effect: {
          kind: "animate",
          target: 0,
          power: { powerOf: "source" },
          toughness: { powerOf: "source" },
          addTypes: [],
          addSubtypes: [],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
