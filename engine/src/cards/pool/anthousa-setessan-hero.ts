import { defineCard } from "../define.js";

// EDHREC rank 27429.
//
// Rulings:
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.
//   [2013-09-15] Heroic abilities won't trigger when a copy of a spell is created on the stack or
//     when a spell's targets are changed to include a creature with a heroic ability.
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2013-09-15] If a land that hasn't been under your control continuously since your last turn
//     began becomes a creature, it can't attack and its activated abilities that include {T} can't
//     be activated. Notably, it can't be tapped for mana that turn.

const TEXT =
  "Heroic — Whenever you cast a spell that targets Anthousa, up to three target lands you control each become 2/2 Warrior creatures until end of turn. They're still lands.";

export default defineCard({
  name: "Anthousa, Setessan Hero",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: { type: "land" } }, max: 3 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "animate",
          target: 0,
          power: 2,
          toughness: 2,
          addTypes: ["creature"],
          addSubtypes: ["Warrior"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
