import { defineCard } from "../define.js";

// "If its power was 3 or greater" reads the creature as it last existed on
// the battlefield (rule 603.10a).

export default defineCard({
  name: "Deathknell Berserker",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Berserker"],
  power: 2,
  toughness: 2,
  text: "When this creature dies, if its power was 3 or greater, create a 2/2 black Zombie Berserker creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { power: { op: "gte", n: 3 } } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Berserker Token", count: 1 },
      resolve: null,
      text: "When this creature dies, if its power was 3 or greater, create a 2/2 black Zombie Berserker creature token.",
    },
  ],
});
