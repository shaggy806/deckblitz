import { defineCard } from "../define.js";

// EDHREC rank 20465.
//
// Opus: the cast trigger reads what was spent on the spell (`trigger-object`'s
// `manaSpent`), even once it has left the stack, and resolves before it (the
// ruling). "Until the end of your next turn" is the impulse permission's
// `your-next-turn`, counted down on your own turns; the card is played under
// the normal timing rules and land plays (the ruling).
const OPUS_TEXT =
  "Opus — Whenever you cast an instant or sorcery spell, this creature gets +1/+0 until end of turn. If five or more mana was spent to cast that spell, exile the top card of your library. You may play that card until the end of your next turn.";

export default defineCard({
  name: "Elemental Mascot",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Bird"],
  power: 1,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${OPUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaSpent: { op: "gte", n: 5 } } },
            then: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
          },
        ],
      },
      resolve: null,
      text: OPUS_TEXT,
    },
  ],
});
