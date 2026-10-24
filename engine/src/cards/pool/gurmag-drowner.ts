import { defineCard } from "../define.js";

// EDHREC rank 28386.
//
// Rulings:
//   [2015-02-25] You can sacrifice the creature with exploit if it's still on the battlefield.
//     This will cause its other ability to trigger.
//   [2015-02-25] You choose whether to sacrifice a creature and which creature to sacrifice as
//     the exploit ability resolves.

const EXPLOITS_TEXT =
  "When this creature exploits a creature, look at the top four cards of your library. Put one of them into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Gurmag Drowner",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Wizard"],
  power: 2,
  toughness: 4,
  text: `Exploit (When this creature enters, you may sacrifice a creature.)\n${EXPLOITS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exploit: sacrifice a creature?",
        effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exploit: true },
      },
      resolve: null,
      text: "Exploit (When this creature enters, you may sacrifice a creature.)",
    },
    {
      trigger: { on: "exploits", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: EXPLOITS_TEXT,
    },
  ],
});
