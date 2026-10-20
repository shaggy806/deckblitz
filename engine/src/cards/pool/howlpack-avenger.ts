import { defineCard } from "../define.js";

// Ill-Tempered Loner's back face. "A permanent you control" includes this
// creature itself; one trigger per permanent dealt damage, each with the
// amount that permanent was dealt (The Sensational She-Hulk's shape, any
// permanent rather than a creature).

const DAMAGE_TEXT =
  "Whenever a permanent you control is dealt damage, this creature deals that much damage to any target.";
const PUMP_TEXT = "{1}{R}: This creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Howlpack Avenger",
  art: "https://cards.scryfall.io/art_crop/back/f/3/f3d1e90b-0c99-46da-b4f6-4b7be27dbd5c.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["nightbound"],
  text: `${DAMAGE_TEXT}\n${PUMP_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "you-control" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  faces: ["Ill-Tempered Loner", "Howlpack Avenger"],
  transform: true,
});
