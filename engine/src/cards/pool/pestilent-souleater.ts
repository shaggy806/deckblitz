import { defineCard } from "../define.js";

export default defineCard({
  name: "Pestilent Souleater",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 3,
  toughness: 3,
  text: "{B/P}: This creature gains infect until end of turn. ({B/P} can be paid with either {B} or 2 life. A creature with infect deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
  activated: [
    {
      cost: { mana: "{B/P}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "infect", duration: "end-of-turn" },
      resolve: null,
      text: "{B/P}: This creature gains infect until end of turn.",
    },
  ],
});
