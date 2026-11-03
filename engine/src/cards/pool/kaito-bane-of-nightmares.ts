import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// "He's a 3/4 Ninja creature", with no "still a planeswalker": the new card
// type replaces the old (rule 205.1a), and the planeswalker type Kaito goes
// with it. So on your turn he isn't a planeswalker, and damage only marks him;
// his loyalty abilities still work (606.3 says "a permanent"). At no counters
// he's a planeswalker again, and goes (704.5i).

const ANIMATE =
  "During your turn, as long as Kaito has one or more loyalty counters on him, he's a 3/4 Ninja creature and has hexproof.";
const EMBLEM = '+1: You get an emblem with "Ninjas you control get +1/+1."';
const SURVEIL = "0: Surveil 2. Then draw a card for each opponent who lost life this turn.";
const STUN = "−2: Tap target creature. Put two stun counters on it.";
const NINJUTSU = ninjutsuText("{1}{U}{B}");

export default defineCard({
  name: "Kaito, Bane of Nightmares",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaito"],
  loyalty: 4,
  text: `${NINJUTSU}\n${ANIMATE}\n${EMBLEM}\n${SURVEIL}\n${STUN}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "self-counters", counter: "loyalty", compare: { op: "gte", n: 1 } }],
      },
      setTypes: ["creature"],
      addSubtypes: ["Ninja"],
      setBasePt: { power: 3, toughness: 4 },
      grantKeywords: ["hexproof"],
      text: ANIMATE,
    },
  ],
  activated: [
    ninjutsu("{1}{U}{B}"),
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Ninjas you control get +1/+1.",
        static: {
          affects: { scope: "filter", filter: { subtype: "Ninja", controlledBy: "you" } },
          grantPt: [1, 1],
          text: "Ninjas you control get +1/+1.",
        },
      },
      resolve: null,
      text: EMBLEM,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 2 },
          { kind: "draw", amount: { playersWithTurnStat: "life-lost", who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: SURVEIL,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 2 },
        ],
      },
      resolve: null,
      text: STUN,
    },
  ],
});
