import { defineCard } from "../define.js";

export default defineCard({
  name: "Rubblebelt Raiders",
  manaCost: "{1}{R/G}{R/G}{R/G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Whenever this creature attacks, put a +1/+1 counter on it for each attacking creature you control.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "+1/+1",
        amount: { countOf: { type: "creature", controlledBy: "you", attacking: true } },
      },
      resolve: null,
      text: "Whenever this creature attacks, put a +1/+1 counter on it for each attacking creature you control.",
    },
  ],
});
