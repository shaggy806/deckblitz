import { defineCard } from "../define.js";

// EDHREC rank 26533. Zendikar Rising.
//
// The granted dies trigger is read off the Diviner as it last existed: a
// simultaneous event snapshots every creature before the first one moves, so
// it triggers when it dies at the same time as the other Wizards (the
// ruling). One instance however many other Wizards (the ruling).

const GRANT_TEXT = 'As long as you control another Wizard, this creature has "When this creature dies, draw a card."';

export default defineCard({
  name: "Expedition Diviner",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1, excludeSelf: true },
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: "When this creature dies, draw a card.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
