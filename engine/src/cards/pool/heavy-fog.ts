import { defineCard } from "../define.js";

// EDHREC rank 24653. Deep Wood's text exactly.
//
// Rulings:
//   [2009-10-01] If all the attacking creatures attack your planeswalkers, you can’t cast Heavy
//     Fog. To cast it, a creature needs to have attacked _you_.
//   [2009-10-01] Heavy Fog prevents only damage that would be dealt to you by attacking creatures.
//     It won’t prevent damage attacking creatures would deal to creatures or planeswalkers you
//     control.
//   [2009-10-01] Heavy Fog prevents all damage attacking creatures would deal to you this turn,
//     not just combat damage. Noncombat damage from those creatures is prevented only if they’re
//     still attacking at the time that damage would be dealt or, if the creature has left the
//     battlefield by then, if it was an attacking creature at the time it left.

export default defineCard({
  name: "Heavy Fog",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nPrevent all damage that would be dealt to you this turn by attacking creatures.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: [],
  effect: { kind: "prevent-damage-to-you", by: { type: "creature", attacking: true } },
});
