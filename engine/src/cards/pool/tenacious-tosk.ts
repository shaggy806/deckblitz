import { defineCard } from "../define.js";

const BLOCK_TEXT = "This creature can't be blocked by more than one creature.";
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.";

export default defineCard({
  name: "Tenacious Tosk",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Tosk", "Rogue"],
  power: 4,
  toughness: 4,
  text: `${BLOCK_TEXT}\n${DAMAGE_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: [{ kind: "cant-be-blocked", byMoreThan: 1 }], text: BLOCK_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
