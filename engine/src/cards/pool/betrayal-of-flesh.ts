import { defineCard } from "../define.js";

// Entwine—Sacrifice three lands (rule 702.42a — "Entwine [cost]" is any
// cost): the entwine kicker with `cost: ""` and `also.sacrifice`, the lands
// chosen as the cost is paid once the spell is on the stack (601.2h).

export default defineCard({
  name: "Betrayal of Flesh",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "entwine",
    also: { text: "Sacrifice three lands", sacrifice: { filter: { type: "land" }, count: 3 } },
  },
  text: "Choose one —\n• Destroy target creature.\n• Return target creature card from your graveyard to the battlefield.\nEntwine—Sacrifice three lands. (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "Destroy target creature.", targets: ["creature"], effect: { kind: "destroy", target: 0 } },
      {
        text: "Return target creature card from your graveyard to the battlefield.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
    ],
    kickedModes: 2,
  },
});
