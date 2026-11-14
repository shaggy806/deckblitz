import { defineCard } from "../define.js";

// Each combat, anyone's: the creatures each half affects are fixed as it
// resolves (rule 611.2c).
const COMBAT_TEXT =
  "At the beginning of each combat, other Goblins and Orcs you control get +2/+2 until end of turn. Creatures your opponents control get -1/-1 until end of turn.";

export default defineCard({
  name: "Bolg, Erebor's Reckoning",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Soldier"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { subtypes: ["Goblin", "Orc"], controlledBy: "you" },
            exceptSource: true,
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "opponent" },
            power: -1,
            toughness: -1,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
