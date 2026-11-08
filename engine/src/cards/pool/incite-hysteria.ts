import { defineCard } from "../define.js";

// EDHREC rank 27218.
//
// Rulings:
//   [2005-10-01] Only one creature is targeted. If that creature leaves the battlefield or
//     otherwise becomes an illegal target, the entire spell doesn't resolve.
//   [2005-10-01] You check which creatures share a color with the target when the spell resolves.
//   [2005-10-01] All creatures that share a color are affected, even your own.
//   [2005-10-01] If it targets a colorless creature, it doesn't affect any other creatures.
//   [2005-10-01] The targeted creature and the creatures that share a color with it at the time
//     Incite Hysteria resolves gain an ability that says they can't block this turn. It doesn't
//     matter if those creatures change colors before blockers are declared.
//
// The set is fixed as it resolves (`restrict`'s `asItResolves`, rule 611.2c);
// `sharesColorWith` includes the target itself (Surge of Zeal).
export default defineCard({
  name: "Incite Hysteria",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: 'Radiance — Until end of turn, target creature and each other creature that shares a color with it gain "This creature can\'t block."',
  targets: ["creature"],
  effect: {
    kind: "restrict",
    filter: { type: "creature", sharesColorWith: 0 },
    asItResolves: true,
    restrictions: ["cant-block"],
  },
});
