import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 18376.
const COMBAT = "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.";
const PING =
  "{2}{R}: This creature deals damage to target creature equal to the number of +1/+1 counters on this creature.";

export default defineCard({
  name: "Falkenrath Exterminator",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Archer"],
  power: 1,
  toughness: 1,
  text: `${COMBAT}\n${PING}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COMBAT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: { countersOn: "source", counter: "+1/+1" } },
      resolve: null,
      text: PING,
    },
  ],
});
