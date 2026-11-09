import { defineCard } from "../define.js";

export default defineCard({
  name: "I'm a Doctor, Not a . . .",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Put a +1/+1 counter on target creature you control. Untap it. Until end of turn, it gets +1/+1 and becomes a Doctor. (It loses all other creature types.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      // Every creature type goes; its other subtypes stay (rule 205.1a).
      { kind: "become", target: 0, setSubtypes: ["Doctor"], duration: "end-of-turn" },
    ],
  },
});
