import { defineCard } from "../define.js";

const ASSIGN_TEXT = "You may have Wolverine assign his combat damage as though he weren't blocked.";
const ATTACK_TEXT = "Whenever a Mutant you control attacks, double its power until end of turn.";

export default defineCard({
  name: "Wolverine, Claws Out",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Berserker", "Hero"],
  power: 2,
  toughness: 5,
  text: `${ASSIGN_TEXT}\n${ATTACK_TEXT}`,
  static: [{ affects: { scope: "self" }, assignAsThoughUnblocked: true, text: ASSIGN_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { subtype: "Mutant" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: { powerOf: "trigger-object", doubling: true },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
