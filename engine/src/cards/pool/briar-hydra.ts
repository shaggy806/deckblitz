import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 13016.
//
// Domain's X is read as the trigger resolves (the ruling), as The Weatherseed
// Treaty's chapter III reads it.
const TEXT =
  "Domain — Whenever this creature deals combat damage to a player, put X +1/+1 counters on target creature you control, where X is the number of basic land types among lands you control.";

export default defineCard({
  name: "Briar Hydra",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Hydra"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { basicLandTypes: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
