import { defineCard } from "../define.js";

// Playtest card. Devotion to Temur is devotion to green, blue and red together (rule 700.5): each
// {G}, {U} or {R} counts, a hybrid pip of two of them once.

const DEVOTION = { devotionTo: ["G", "U", "R"] } as const;

export default defineCard({
  name: "Devoted Temur",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Ranger"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nWhen this creature enters, target creature gets +X/+X until end of turn, where X is your devotion to Temur. (Each {G}, {U}, or {R} in the mana cost of permanents you control counts towards your devotion to Temur.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: DEVOTION, toughness: DEVOTION, duration: "end-of-turn" },
      resolve: null,
      text: "When this creature enters, target creature gets +X/+X until end of turn, where X is your devotion to Temur.",
    },
  ],
});
