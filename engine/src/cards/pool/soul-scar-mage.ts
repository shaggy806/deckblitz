import { defineCard } from "../define.js";

const REPLACE = "If a source you control would deal noncombat damage to a creature an opponent controls, put that many -1/-1 counters on that creature instead.";

export default defineCard({
  name: "Soul-Scar Mage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: `Prowess\n${REPLACE}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Prowess",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: false,
        source: { controlledBy: "you" },
        toFilter: { type: "creature", controlledBy: "opponent" },
        instead: { effect: { kind: "add-counter", target: "trigger-recipient", counter: "-1/-1", amount: "x" } },
      },
      text: REPLACE,
    },
  ],
});
