import { defineCard } from "../define.js";

// EDHREC rank 13426. Marvel Super Heroes.
//
// A batched damage trigger (Faerie Bladecrafter's shape) over any damage,
// combat or not: once per player dealt damage by at least one Hero you
// control in one simultaneous event, however many Heroes dealt it. The
// Thing is a Hero himself.
const TEXT = "Whenever one or more Heroes you control deal damage to a player, put two +1/+1 counters on The Thing.";

export default defineCard({
  name: "The Thing, Ben Grimm",
  manaCost: "{5}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtype: "Hero" }, to: "player" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
