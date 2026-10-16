import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature or another creature you control is turned face up, put +1/+1 counters on that creature equal to its power.";

export default defineCard({
  name: "Experiment Twelve",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Lizard", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  morph: { keyword: "disguise", cost: "{4}{G}" },
  text: `Trample\n${TEXT}\nDisguise {4}{G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  triggered: [
    {
      // "This creature or another creature you control": any creature you
      // control, this one included — turned face up, it has this ability
      // from then on (rule 708.8; Cryptid Inspector's shape). Its power is
      // read as the ability resolves.
      trigger: { on: "turned-face-up", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: { powerOf: "trigger-object" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
