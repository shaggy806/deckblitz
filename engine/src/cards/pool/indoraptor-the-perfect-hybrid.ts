import { defineCard } from "../define.js";

// EDHREC rank 8912. Commander #211.
//
// Bloodthirst X (rule 702.54c): counters equal to the damage your opponents
// were dealt this turn, whatever dealt it (the ruling). Enrage's damage is
// from Indoraptor, read as it last existed if the damage killed it.
const BLOODTHIRST = "Bloodthirst X (This creature enters with X +1/+1 counters on it, where X is the damage dealt to your opponents this turn.)";
const ENRAGE = "Enrage — Whenever Indoraptor is dealt damage, choose an opponent at random. Indoraptor deals damage equal to its power to that player unless they sacrifice a nontoken creature of their choice.";

export default defineCard({
  name: "Indoraptor, the Perfect Hybrid",
  manaCost: "{1}{B/G}{R}",
  colors: ["B", "G", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Mutant"],
  power: 3,
  toughness: 1,
  keywords: ["menace"],
  text: `${BLOODTHIRST}\nMenace\n${ENRAGE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { turnStat: "damage-taken", who: "each-opponent" } },
      },
      text: BLOODTHIRST,
    },
  ],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "choose-opponent",
        random: true,
        then: {
          kind: "each-player-may",
          who: "that-player",
          options: [{ sacrifice: { type: "creature", token: false }, text: "Sacrifice a nontoken creature" }],
          ifDidnt: { kind: "damage", amount: { powerOf: "source" }, who: "that-player" },
        },
      },
      resolve: null,
      text: ENRAGE,
    },
  ],
});
