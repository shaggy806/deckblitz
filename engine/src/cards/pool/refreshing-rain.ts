import { defineCard } from "../define.js";

// EDHREC rank 28224. Submerge's free cast, Swamp and Forest.

export default defineCard({
  name: "Refreshing Rain",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "If an opponent controls a Swamp and you control a Forest, you may cast this spell without paying its mana cost.\nTarget player gains 6 life.",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "opponent-controls", filter: { subtype: "Swamp" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Forest" }, atLeast: 1 },
      ],
    },
  },
  targets: ["player"],
  effect: { kind: "gain-life", amount: 6, toControllerOfTarget: 0 },
});
