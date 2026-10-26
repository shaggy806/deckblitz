import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 25849. Stone Giant's shape: the delayed destroy
// has no target of its own (rule 603.7c), so it destroys that creature even
// if it's no longer a creature you control by the end step.

const TEXT =
  "{T}: Target creature you control gets +1/+0 and gains flying until end of turn. Destroy that creature at the beginning of the next end step.";

export default defineCard({
  name: "Mogg Cannon",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "destroy", target: 0 },
            text: "Destroy that creature.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
