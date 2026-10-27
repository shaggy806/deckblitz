import { defineCard } from "../define.js";

// EDHREC rank 4183. The leaving creature's +1/+1 counters are read as it
// last existed on the battlefield (the ruling).

const LEAVES_TEXT =
  "Whenever a creature you control with a +1/+1 counter on it leaves the battlefield, create a Mutagen token for each +1/+1 counter on it.";
const MUTAGEN_REMINDER =
  '(A Mutagen token is an artifact with "{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.")';
const TAP_TEXT = "{T}: Exile target card from a graveyard. Create a Mutagen token.";

export default defineCard({
  name: "The Ooze",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${LEAVES_TEXT} ${MUTAGEN_REMINDER}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Mutagen Token",
        count: { countersOn: "trigger-object", counter: "+1/+1" },
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "create-token", token: "Mutagen Token", count: 1 },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
