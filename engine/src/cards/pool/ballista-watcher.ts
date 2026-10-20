import { defineCard } from "../define.js";

const PING_TEXT = "{2}{R}, {T}: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Ballista Watcher",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Werewolf"],
  power: 4,
  toughness: 3,
  keywords: ["daybound"],
  text: `${PING_TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
  faces: ["Ballista Watcher", "Ballista Wielder"],
  transform: true,
});
