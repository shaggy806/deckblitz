import { defineCard } from "../define.js";

// EDHREC rank 14560.
//
// Rulings:
//   [2016-07-13] You may cast Waxing Moon without targeting a Werewolf. If you do choose a target,
//     and that target becomes illegal, Waxing Moon doesn't resolve, and your creatures won't gain
//     trample.
//
// An optional slot: left empty, the spell has no targets and still grants
// trample; chosen and gone illegal, the spell doesn't resolve (rule 608.2b).

export default defineCard({
  name: "Waxing Moon",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Transform up to one target Werewolf you control. Creatures you control gain trample until end of turn.",
  targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Werewolf" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "transform", target: 0 },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
