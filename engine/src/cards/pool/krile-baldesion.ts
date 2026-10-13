import { defineCard } from "../define.js";

// EDHREC rank 7128.
//
// The target is chosen as the trigger goes on the stack, against the spell's
// mana value then — its chosen X counted, a graveyard card's {X} as 0 (the
// rulings). "Do this only once each turn" limits the return, not the
// trigger: a turn's declined return doesn't use it up (`may`'s
// `oncePerTurn` — Cosmic Crucible's shape). The trigger resolves before the
// spell, and still does if the spell is countered (the ruling).

const TRACE_TEXT =
  "Trace Aether — Whenever you cast a noncreature spell, you may return target creature card with mana value equal to that spell's mana value from your graveyard to your hand. Do this only once each turn.";

export default defineCard({
  name: "Krile Baldesion",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Wizard"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${TRACE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "eq", n: { amount: { manaValueOf: "trigger-object" } } } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return that creature card from your graveyard to your hand?",
        oncePerTurn: true,
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TRACE_TEXT,
    },
  ],
});
