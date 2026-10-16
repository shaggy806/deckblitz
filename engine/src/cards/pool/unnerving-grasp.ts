import { defineCard } from "../define.js";

// EDHREC rank 16104.
//
// Ruling (2024-09-20): "If the target nonland permanent is an illegal target
// when Unnerving Grasp tries to resolve, it won't resolve and none of its
// effects will happen. You won't manifest dread." A spell whose every chosen
// target is illegal doesn't resolve (rule 608.2b); with none chosen ("up to
// one"), it resolves and manifests dread.
export default defineCard({
  name: "Unnerving Grasp",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return up to one target nonland permanent to its owner's hand. Manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)",
  targets: [{ kind: "optional", of: "nonland-permanent" }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "return-to-hand", target: 0 }, { kind: "manifest-dread" }],
  },
});
