import { defineCard } from "../define.js";

// An exalted counter gives the creature an instance of exalted (rule 122.1b),
// one per counter (the ruling), each triggering on its own — listed by
// `Game.effectiveTriggeredEntries`.

const ETB = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const PAY =
  "Pay {E}{E}: Put an exalted counter on target creature you control. Activate only as a sorcery. (Whenever a creature you control attacks alone, it gets +1/+1 until end of turn for each instance of exalted among permanents you control.)";

export default defineCard({
  name: "Emissary of Soulfire",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Djinn", "Monk"],
  power: 1,
  toughness: 4,
  text: `${ETB}\n${PAY}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ETB,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 2 },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "exalted", amount: 1 },
      sorcerySpeed: true,
      resolve: null,
      text: PAY,
    },
  ],
});
