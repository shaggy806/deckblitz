import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 20041.
//
// Rulings:
//   [2013-09-15] Heroic abilities won’t trigger when a copy of a spell is created on the stack or
//     when a spell’s targets are changed to include a creature with a heroic ability.
//   [2013-09-15] Heroic abilities will trigger only once per spell, even if that spell targets the
//     creature with the heroic ability multiple times.
//   [2013-09-15] Heroic abilities will resolve before the spell that caused them to trigger.
//   [2014-02-01] The ability can target any creature except Akroan Conscriptor, including one
//     that’s untapped or one you already control.
//   [2014-02-01] Gaining control of a creature doesn’t cause you to gain control of any Auras or
//     Equipment attached to it. Notably, if that creature is enchanted by an Aura with bestow and
//     dies while under your control, the Aura’s controller will continue to control the creature
//     that Aura becomes.
//   [2014-02-01] If you control a legendary creature and gain control of another legendary
//     creature with the same name, you’ll choose one to remain on the battlefield and put the
//     other into its owner’s graveyard.

export default defineCard({
  name: "Akroan Conscriptor",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 2,
  text: "Heroic — Whenever you cast a spell that targets this creature, gain control of another target creature until end of turn. Untap that creature. It gains haste until end of turn.",
  // TODO(scaffold): Heroic — Whenever you cast a spell that targets this creature, gain control of another target creature until end of turn. Untap that creature. It gains haste until end of turn.
});
