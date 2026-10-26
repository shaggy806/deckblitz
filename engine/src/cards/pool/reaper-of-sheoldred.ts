import { defineCard } from "../define.js";

// Rulings:
//   [2011-06-01] The source's controller will get one poison counter for each time that source
//     deals damage to Reaper of Sheoldred, not one poison counter for each 1 damage dealt.
//
// A `deals-damage` trigger aimed at this creature (`to: "self"`) fires once
// per damage event, whatever the amount; the source is the trigger object, so
// `"trigger-controller"` is that source's controller.

export default defineCard({
  name: "Reaper of Sheoldred",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 2,
  toughness: 5,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nWhenever a source deals damage to this creature, that source's controller gets a poison counter.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a source deals damage to this creature, that source's controller gets a poison counter.",
    },
  ],
});
