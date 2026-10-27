import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 25253.
//
// Rulings:
//   [2004-10-04] It only destroys goblins if it is on the battlefield at the end of turn.
//
// "Goblin creatures" is every player's; the end-step trigger is each end step,
// any player's, and destroys every Goblin — the Pyromancer among them.

const ETB_TEXT = "When this creature enters, Goblin creatures get +3/+0 until end of turn.";
const END_TEXT = "At the beginning of the end step, destroy all Goblins.";

export default defineCard({
  name: "Goblin Pyromancer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ETB_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Goblin" },
        power: 3,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: { kind: "destroy-all", filter: { subtype: "Goblin" } },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
