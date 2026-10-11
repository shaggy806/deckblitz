import { defineCard } from "../define.js";

export default defineCard({
  name: "Nori, Teller of Tales",
  manaCost: "{1}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 2,
  toughness: 2,
  text: "Whenever Nori attacks, target attacking creature gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever Nori attacks, target attacking creature gains first strike until end of turn.",
    },
  ],
});
