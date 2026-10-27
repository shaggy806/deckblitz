import { defineCard } from "../define.js";

// EDHREC rank 15338.
//
// One target; its controller's other creatures sharing its name (rule
// 201.2a) go with it, untargeted (`CardFilter.sameNameAsTarget`) — creatures
// only, not a namesake that isn't one (the ruling). Then that player
// investigates once per nontoken creature exiled this way.

export default defineCard({
  name: "Declaration in Stone",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target creature and all other creatures its controller controls with the same name as that creature. That player investigates for each nontoken creature exiled this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "exile-all",
        filter: { type: "creature", controlledBy: "you", sameNameAsTarget: 0 },
        controlledByTarget: 0,
      },
      {
        kind: "create-token",
        token: "Clue Token",
        who: "target-controller",
        count: { thisWay: "exiled", filter: { token: false } },
      },
    ],
  },
});
