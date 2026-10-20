import { defineCard } from "../define.js";

// EDHREC rank 7207.
//
// Rulings:
//   [2021-11-19] The triggered ability on each face still works even if that damage causes this
//     creature to die.
//   [2021-11-19] If the damage causes this creature to die before the triggered ability resolves,
//     use last known information to determine whether or not this creature had abilities such as
//     deathtouch and lifelink. If it did, those abilities will apply to the damage
//
// Boros Reckoner's trigger; the back face is Howlpack Avenger.

const DAMAGE_TEXT = "Whenever this creature is dealt damage, it deals that much damage to any target.";
const PUMP_TEXT = "{1}{R}: This creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Ill-Tempered Loner",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["daybound"],
  text: `${DAMAGE_TEXT}\n${PUMP_TEXT}\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)`,
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
      trigger: { on: "dealt-damage", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  faces: ["Ill-Tempered Loner", "Howlpack Avenger"],
  transform: true,
});
