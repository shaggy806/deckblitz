import { defineCard } from "../define.js";

// Ruling: casting Hand of the Praetors itself doesn't trigger it — it's on
// the stack, not the battlefield, as it's cast.

export default defineCard({
  name: "Hand of the Praetors",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 3,
  toughness: 2,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nOther creatures you control with infect get +1/+1.\nWhenever you cast a creature spell with infect, target player gets a poison counter.",
  static: [
    {
      affects: { scope: "creatures-you-control", withKeyword: "infect", excludeSelf: true },
      grantPt: [1, 1],
      text: "Other creatures you control with infect get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", keyword: "infect" } },
      targets: ["player"],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, target: 0 },
      resolve: null,
      text: "Whenever you cast a creature spell with infect, target player gets a poison counter.",
    },
  ],
});
