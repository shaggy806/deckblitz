import { defineCard } from "../define.js";

// EDHREC rank 28617. March of the Machine.
//
// "A transformed permanent" (rule 701.27g) is `transformed: true`: a
// double-faced permanent with its back face up, any player's choice of which
// one never mattering but its controller — "you control". The Whelp is
// single-faced, so it never counts itself. The granted dies trigger is read off
// the Whelp as it last existed, so it fires when the Whelp dies together with
// the transformed permanent (the Expedition Diviner shape).

const GRANT_TEXT = 'As long as you control a transformed permanent, this creature has "When this creature dies, draw a card."';

export default defineCard({
  name: "Oculus Whelp",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Dragon"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { transformed: true }, atLeast: 1 },
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
