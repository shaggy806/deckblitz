import { defineCard } from "../define.js";

// EDHREC rank 24500.
//
// Rulings:
//   [2023-04-14] If Vengeant Earth targets a creature you control, Vengeant Earth will overwrite
//     any previous effects that set the creature's power and toughness to specific values.
//     Effects that otherwise modify the target creature's power and toughness will still apply
//     no matter when they took effect. The same is true for +1/+1 counters.
//   [2023-04-14] The target creature or land will keep any abilities it previously had.
//   [2023-04-14] If the resulting creature attacks, the defending player must assign at least one
//     blocker to it during the declare blockers step if that player controls any creatures that
//     could block it.
//   [2023-04-14] You may target a land that's already a creature. For example, if you target a
//     land that's also a 0/0 creature and has three +1/+1 counters on it, the resulting land
//     creature will be 7/7.
//
// Disturbed Slumber's shape: `animate` adds the types (layer 4), haste
// (layer 6) and sets base P/T 4/4 (layer 7b), keeping its other types and
// abilities; counters and modifications still apply on top.

export default defineCard({
  name: "Vengeant Earth",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature or land you control becomes a 4/4 Elemental creature with haste in addition to its other types until end of turn. It must be blocked this turn if able.",
  targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["creature", "land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        keywords: ["haste"],
        duration: "end-of-turn",
      },
      { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
    ],
  },
});
