import { defineCard } from "../define.js";

// EDHREC rank 21096. Opus: Thunderdrum Soloist's "instead" — one or the other
// pump, by what was spent on the spell (the trigger resolves before it, the
// ruling).
const ETB_TEXT =
  "When this creature enters, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)";
const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. If five or more mana was spent to cast that spell, this creature gets +2/+2 until end of turn instead.";

export default defineCard({
  name: "Deluge Virtuoso",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${OPUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
        then: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
        else: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
