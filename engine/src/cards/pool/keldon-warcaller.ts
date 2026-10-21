import { defineCard } from "../define.js";

export default defineCard({
  name: "Keldon Warcaller",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, put a lore counter on target Saga you control.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Saga" } }],
      effect: { kind: "add-counter", target: 0, counter: "lore", amount: 1 },
      resolve: null,
      text: "Whenever this creature attacks, put a lore counter on target Saga you control.",
    },
  ],
});
