import { defineCard } from "../define.js";

// EDHREC rank 24131. Throne of Eldraine.
//
// Rulings:
//   [2019-10-04] Wandermare's ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered.
//   [2019-10-04] If an effect refers to a card, spell, or permanent that has an Adventure, it
//     won't find an instant or sorcery spell on the stack that's been cast as an Adventure.
//
// A creature spell that `hasAdventure` (rule 715.2a): one cast as its
// Adventure is an instant or sorcery on the stack (715.3), so the creature
// clause leaves it out.

const TRIGGER_TEXT =
  "Whenever you cast a creature spell that has an Adventure, put a +1/+1 counter on this creature. (It doesn't need to have gone on the adventure first.)";

export default defineCard({
  name: "Wandermare",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 3,
  toughness: 3,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", hasAdventure: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
