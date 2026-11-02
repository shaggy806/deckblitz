import { defineCard } from "../define.js";

const PUMP = "{1}{R}: Goblins you control get +1/+0 and gain haste until end of turn.";
const PACK =
  "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, create a 1/1 red Goblin creature token that's tapped and attacking.";

const GOBLINS = { type: "creature", subtype: "Goblin", controlledBy: "you" } as const;

// Adventures in the Forgotten Realms.
export default defineCard({
  name: "Battle Cry Goblin",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  text: `${PUMP}\n${PACK}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: GOBLINS, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: GOBLINS, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: PACK,
    },
  ],
});
