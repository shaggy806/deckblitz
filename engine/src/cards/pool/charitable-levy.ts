import { defineCard } from "../define.js";

// EDHREC rank 7081.
// The tax is everyone's, its own controller's too. The trigger resolves even
// if the spell is countered (the ruling); "if you do" is `sacrifice-source`'s
// tail, which happens only when the trigger's controller still controls the
// Levy and sacrifices it (the third ruling, rule 701.21a).
const TAX_TEXT = "Noncreature spells cost {1} more to cast.";
const TRIGGER_TEXT =
  "Whenever a player casts a noncreature spell, put a collection counter on this enchantment. Then if there are three or more collection counters on it, sacrifice it. If you do, draw a card, then you may search your library for a Plains card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Charitable Levy",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${TAX_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["creature"] }, increaseGeneric: 1 },
      text: TAX_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "collection", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "collection", compare: { op: "gte", n: 3 } },
            then: {
              kind: "sacrifice-source",
              then: {
                kind: "sequence",
                effects: [
                  { kind: "draw", amount: 1 },
                  {
                    kind: "may",
                    prompt: "Search your library for a Plains card?",
                    effect: {
                      kind: "search-library",
                      filter: { subtype: "Plains" },
                      destination: "battlefield",
                      min: 0,
                      max: 1,
                      enterTapped: true,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
