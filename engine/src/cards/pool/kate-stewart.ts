import { defineCard } from "../define.js";

// Fires per permanent: time counters put on several at once (time travel) make
// a Soldier for each, as Hapatra's "whenever you put one or more counters on a
// creature" does. X is read as the pump resolves (rule 608.2h); every
// attacking creature gets it, whoever controls it.
const SOLDIER_TEXT =
  "Whenever you put one or more time counters on a permanent you control, create a 1/1 white Soldier creature token.";
const ATTACK_TEXT =
  "Whenever Kate Stewart attacks, you may pay {8}. If you do, attacking creatures get +X/+X until end of turn, where X is the number of time counters among permanents you control.";
const X = { aggregate: "sum", of: { counters: "time" }, filter: { controlledBy: "you" } } as const;

export default defineCard({
  name: "Kate Stewart",
  manaCost: "{1}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 3,
  toughness: 3,
  text: `${SOLDIER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "you-control", counter: "time", byYou: true },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: SOLDIER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {8}: attacking creatures get +X/+X, where X is the number of time counters among permanents you control?",
        cost: "{8}",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", attacking: true },
          power: X,
          toughness: X,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
