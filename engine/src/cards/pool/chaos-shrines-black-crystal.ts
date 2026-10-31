import { defineCard } from "../define.js";

// The creature card is exiled from your graveyard with this artifact (rule
// 607.2a); only those can come back, under your control (110.2a), with a
// finality counter (one that would die goes to exile instead, 122.1g).

const DIES = "Whenever a nontoken creature you control dies, exile it.";
const UPKEEP =
  "At the beginning of your upkeep, you may put a creature card exiled with Chaos Shrine's Black Crystal onto the battlefield under your control with a finality counter on it.";

export default defineCard({
  name: "Chaos Shrine's Black Crystal",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${DIES}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", linked: true },
      resolve: null,
      text: DIES,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        withCounters: { kind: "finality", amount: 1 },
        leftover: "stay",
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
