import { defineCard } from "../define.js";

// EDHREC rank 25075. The count is read once as the trigger resolves (the
// ruling), and counts the Brawler itself.

const TEXT = "Whenever this creature attacks, it gets +1/+0 until end of turn for each Elemental you control.";

export default defineCard({
  name: "Lavakin Brawler",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Warrior"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { subtype: "Elemental", controlledBy: "you" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
