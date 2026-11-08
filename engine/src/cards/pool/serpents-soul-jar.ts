import { defineCard } from "../define.js";

export default defineCard({
  name: "Serpent's Soul-Jar",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: "Whenever an Elf you control dies, exile it.\n{T}, Pay 2 life: Until end of turn, you may cast a creature spell from among cards exiled with this artifact.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Elf" } },
      resolve: null,
      text: "Whenever an Elf you control dies, exile it.",
      targets: [],
      effect: { kind: "exile", target: "trigger-object", linked: true },
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 2 },
      resolve: null,
      text: "{T}, Pay 2 life: Until end of turn, you may cast a creature spell from among cards exiled with this artifact.",
      targets: [],
      effect: { kind: "player-effect", duration: "end-of-turn", mayPlay: { from: "exile", linked: true, spell: { type: "creature" }, upTo: 1 } },
    },
  ],
});
