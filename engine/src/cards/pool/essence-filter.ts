import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 28000.
//
// Not a "choose one —" spell (rule 700.2): the "or" is a choice made as it
// resolves (rule 608.2d), so an unannounced `modal`.

export default defineCard({
  name: "Essence Filter",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all enchantments or all nonwhite enchantments.",
  targets: [],
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Destroy all enchantments", effect: { kind: "destroy-all", filter: { type: "enchantment" } } },
      {
        text: "Destroy all nonwhite enchantments",
        effect: { kind: "destroy-all", filter: { type: "enchantment", notColors: ["W"] } },
      },
    ],
  },
});
