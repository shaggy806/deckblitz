import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever Rhino attacks, if you've cast a spell with mana value 4 or greater this turn, draw a card.";

export default defineCard({
  name: "Rhino, Barreling Brute",
  manaCost: "{3}{R}{R}{G}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 6,
  toughness: 7,
  keywords: ["vigilance", "trample", "haste"],
  text: `Vigilance, trample, haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      // An intervening if (rule 603.4) over the spells cast this turn, each
      // read as it was cast (its {X} counted). Rhino himself counts.
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "cast-this-turn", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
