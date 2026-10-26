import { defineCard } from "../define.js";

// EDHREC rank 24624. Morningtide.
//
// Rulings:
//   [2008-04-01] You may target zero, one, or two Swamps with this ability.
//   [2008-04-01] A Swamp affected by this ability is still a land, still a Swamp, and may still be
//     tapped for black mana. If it had any other card types or subtypes, it retains those as well.
//     This ability doesn’t affect the permanent’s colors, if any.
//
// Anthousa, Setessan Hero's shape: up to two targets, each animated in addition
// to its types, colours untouched.
const TEXT =
  "{T}: Up to two target Swamps each become 3/5 Treefolk Warrior creatures in addition to their other types until end of turn.";

export default defineCard({
  name: "Fendeep Summoner",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 3,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "any-number", of: { kind: "permanent", filter: { subtype: "Swamp" } }, max: 2 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: {
          kind: "animate",
          target: 0,
          power: 3,
          toughness: 5,
          addTypes: ["creature"],
          addSubtypes: ["Treefolk", "Warrior"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
