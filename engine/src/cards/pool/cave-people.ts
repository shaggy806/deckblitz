import { defineCard } from "../define.js";

export default defineCard({
  name: "Cave People",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 4,
  text: "Whenever this creature attacks, it gets +1/-2 until end of turn.\n{1}{R}{R}, {T}: Target creature gains mountainwalk until end of turn. (It can't be blocked as long as defending player controls a Mountain.)",
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "mountainwalk", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}{R}, {T}: Target creature gains mountainwalk until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, it gets +1/-2 until end of turn.",
    },
  ],
});
