import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 19641.
//
// "Your team" is "you" outside a team game (rule 102.4).

const TEXT = "Whenever another Warrior your team controls enters, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Decorated Champion",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Warrior" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
