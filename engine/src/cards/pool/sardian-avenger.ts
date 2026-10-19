import { defineCard } from "../define.js";

// EDHREC rank 7941.

const ATTACK_TEXT =
  "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of artifacts your opponents control.";
const DAMAGE_TEXT =
  "Whenever an artifact an opponent controls is put into a graveyard from the battlefield, this creature deals 1 damage to that player.";

export default defineCard({
  name: "Sardian Avenger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike", "trample"],
  text: `First strike, trample\n${ATTACK_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "artifact", controlledBy: "opponent" } },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "artifact", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
