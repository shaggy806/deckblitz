import { defineCard } from "../define.js";

// "That creature can't be blocked by creatures your opponents control" is a
// rule on the creature for the turn (rule 509.1b), read from Rikku's
// controller's side; once it's blocked, it stays blocked (the ruling). The
// trigger fires once per creature per placement (rule 122.6), whoever controls
// it. Steal moves one counter of a kind its controller chooses (rule 122.5 —
// a move, so removal and placement both happen, per the ruling).

const TRIGGER_TEXT =
  "Whenever you put one or more counters on a creature, until end of turn, that creature can't be blocked by creatures your opponents control.";
const STEAL_TEXT =
  "Steal — {1}, {T}: Move a counter from target creature an opponent controls onto target creature you control. Activate only as a sorcery.";

export default defineCard({
  name: "Rikku, Resourceful Guardian",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n${STEAL_TEXT}`,
  triggered: [
    {
      trigger: { on: "counters-put", who: "any", filter: { type: "creature" }, byYou: true },
      targets: [],
      effect: {
        kind: "restrict",
        target: "trigger-object",
        restrictions: [],
        cantBeBlockedBy: { type: "creature", controlledBy: "opponent" },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature-an-opponent-controls", "creature-you-control"],
      effect: { kind: "move-counters", from: 0, to: 1 },
      resolve: null,
      text: STEAL_TEXT,
      sorcerySpeed: true,
    },
  ],
});
