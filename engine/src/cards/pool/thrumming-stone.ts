import { defineCard } from "../define.js";

// EDHREC rank 2283.
//
// Rulings:
//   [2006-07-15] If you cast a spell that already has ripple (such as Surging Flame, which has
//     ripple 4) while Thrumming Stone is on the battlefield, both ripple abilities will trigger
//     separately. Assuming you choose to do all "you may" actions, when the first instance of
//     ripple resolves, you reveal the top four cards of your library, cast all Surging Flames, and
//     put the rest of the cards on the bottom of your library. Any new Surging Flames are on the
//     stack on top of the other instance of ripple, so they'll resolve next. Each of them also has
//     two instances of ripple, which trigger separately, and the process continues until the
//     ripple abilities don't reveal any Surging Flames.
//   [2006-07-15] If you cast half of a split card (for example, Hit) and reveal another one of
//     those split cards when the ripple ability resolves (for example, Hit // Run), you may cast
//     either half of that split card (Hit or Run) without paying its mana cost.
//
// The `ripple` helper's trigger, granted to every spell its controller casts
// (`grantsToSpells`, as The First Sliver grants cascade), with "the same name
// as that spell" read off the trigger object — the spell whose casting fired
// it — rather than a printed name. A spell cast by the ripple is cast, so it
// has ripple 4 too (rule 702.60b: each instance triggers separately).

const RIPPLE_TEXT =
  "Ripple 4 (When you cast this spell, you may reveal the top four cards of your library. You may cast spells with the same name as this spell from among those cards without paying their mana costs. Put the rest on the bottom of your library.)";
const STATIC_TEXT = "Spells you cast have ripple 4.";

export default defineCard({
  name: "Thrumming Stone",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${STATIC_TEXT} (Whenever you cast a spell, you may reveal the top four cards of your library. You may cast spells with the same name as that spell from among the revealed cards without paying their mana costs. Put the rest on the bottom of your library.)`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: {
        triggered: [
          {
            trigger: { on: "this-cast" },
            targets: [],
            effect: {
              kind: "may",
              prompt: "Reveal the top 4 cards of your library (ripple 4)?",
              effect: {
                kind: "cast-now",
                from: { libraryTop: 4, reveal: true },
                spell: { sameNameAsTriggerObject: true },
                free: true,
                repeat: true,
                rest: "bottom-any-order",
              },
            },
            resolve: null,
            text: RIPPLE_TEXT,
          },
        ],
      },
      text: STATIC_TEXT,
    },
  ],
});
