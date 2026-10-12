import { defineCard } from "../define.js";

export default defineCard({
  name: "Vector Asp",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Snake"],
  power: 1,
  toughness: 1,
  text: "{B}: This creature gains infect until end of turn. (It deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "infect", duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gains infect until end of turn.",
    },
  ],
});
