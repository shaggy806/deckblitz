import { defineCard } from "../define.js";

// EDHREC rank 9183.
//
// Rulings:
//   A creature equipped by an Equipment with hone counters on it gets +1/+0 for each hone counter
//   on that Equipment. This effect is from the counter itself rather than an ability on the
//   Equipment, so even if the Equipment loses some of its abilities, each hone counter will still
//   grant +1/+0 to the creature.
//
// A hone counter's +1/+0 is read in layer 7c (rule 122.1j, `honeBonus`).

const TEXT = "Whenever Dwalin enters or attacks, put a hone counter on each Equipment you control.";
const EFFECT = { kind: "add-counter-all", filter: { subtype: "Equipment", controlledBy: "you" }, counter: "hone", amount: 1 } as const;

export default defineCard({
  name: "Dwalin, Weaponmaster",
  manaCost: "{1}{R/W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT} (Each hone counter on an Equipment grants +1/+0 to equipped creature.)`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, sameAbilityAs: 0, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});
