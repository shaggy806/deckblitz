import { defineCard } from "../define.js";

const OFF_TURN = "Whenever a player casts a spell, if it's not their turn, this creature deals 4 damage to them.";
const GROWS = "Whenever you activate an exhaust ability, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Adrenaline Jockey",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Pilot"],
  power: 3,
  toughness: 3,
  text: `${OFF_TURN}\n${GROWS}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", offTurn: true },
      targets: [],
      effect: { kind: "damage", amount: 4, who: "trigger-controller" },
      resolve: null,
      text: OFF_TURN,
    },
    {
      trigger: { on: "activates-ability", who: "you", exhaust: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GROWS,
    },
  ],
});
