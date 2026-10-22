import { defineCard } from "../define.js";

// EDHREC rank 25737. Ixalan. It can target itself (the ruling).

export default defineCard({
  name: "Jade Guardian",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["hexproof"],
  text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)\nWhen this creature enters, put a +1/+1 counter on target Merfolk you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Merfolk" } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on target Merfolk you control.",
    },
  ],
});
