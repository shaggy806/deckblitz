import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// TMT. Lands, and Mutant, Ninja or Turtle spells, from the top of the
// library (rule 601.3), every cost paid and timing kept (the second ruling).
// "If you cast a creature spell this way, that creature enters with an
// additional +1/+1 counter" is the permission's `entersWith`, reaching only a
// spell `gainsIf` matches as it's cast (rule 400.7h): a creature spell, not a
// land played this way nor a noncreature kindred spell; the counter is one it
// enters with (rule 614.1c).
//
// Rulings:
//   [2026-01-27] If the top card of your library changes while you're casting a spell, playing a
//     land, activating an ability, or taking a special action, you can't look at the new top card
//     until you finish doing so. This means that if you cast the top card of your library, you
//     can't look at the next one until you're done paying for that spell.
//   [2026-01-27] Mikey & Don's last ability allows you to cast the top card of your library if the
//     resulting spell is a Mutant, Ninja, or Turtle spell. You pay all required costs, and timing
//     restrictions apply. If that spell is an instant (most likely a kindred instant) or has
//     flash, you'll be able to cast it any time you could cast an instant, even on an opponent's
//     turn.
//   [2026-01-27] Mikey & Don's second ability lets you look at the top card of your library
//     whenever you want (with one restriction—see below), even if you don't have priority. This
//     action doesn't use the stack. Knowing what that card is becomes part of the information you
//     have access to, just like you can look at the cards in your hand.

const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT =
  "You may play lands and cast Mutant, Ninja, or Turtle spells from the top of your library. If you cast a creature spell this way, that creature enters with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Mikey & Don, Party Planners",
  manaCost: "{2}{G/U}{G/U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 3,
  toughness: 3,
  text: `Ward {2}\n${LOOK_TEXT}\n${PLAY_TEXT}`,
  triggered: [ward({ mana: "{2}" })],
  static: [
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK_TEXT },
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "library-top",
        play: true,
        spell: { anyOf: [{ subtype: "Mutant" }, { subtype: "Ninja" }, { subtype: "Turtle" }] },
        entersWith: { kind: "+1/+1", amount: 1 },
        gainsIf: { type: "creature" },
      },
      text: PLAY_TEXT,
    },
  ],
});
