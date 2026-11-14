import { defineCard } from "../define.js";

// EDHREC rank 16961. "Whenever Aisha deals combat damage" — to anything, once
// per combat damage event (a first-strike step and a regular one each count),
// with "that damage" the total it dealt in that event.
const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const STRIKE_TEXT = "{R/W}: Aisha of Sparks and Smoke gains first strike until end of turn.";
const DAMAGE_TEXT =
  "Whenever Aisha deals combat damage, you may cast a sorcery spell from your hand with mana value less than or equal to that damage without paying its mana cost.";

export default defineCard({
  name: "Aisha of Sparks and Smoke",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 2,
  text: `${PROWESS_TEXT}\n${STRIKE_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "self", combat: true },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "hand",
        free: true,
        spell: { type: "sorcery", manaValue: { op: "lte", n: { amount: { triggerValue: true } } } },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R/W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: STRIKE_TEXT,
    },
  ],
});
