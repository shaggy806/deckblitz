import { defineCard } from "../define.js";

// Miles Morales's back face. Each kind of counter on each creature is doubled.
const CAMO_TEXT =
  "Camouflage — {2}: Put a +1/+1 counter on Ultimate Spider-Man. He gains hexproof and becomes colorless until end of turn.";
const ATTACK_TEXT =
  "Whenever you attack, double the number of each kind of counter on each Spider and legendary creature you control.";

export default defineCard({
  name: "Ultimate Spider-Man",
  art: "https://cards.scryfall.io/art_crop/back/9/f/9f8b4d9b-208a-4673-a617-5e3edd069c33.jpg",
  manaCost: "{3}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 4,
  toughness: 3,
  keywords: ["first-strike", "haste"],
  text: `First strike, haste\n${CAMO_TEXT}\n${ATTACK_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "hexproof", duration: "end-of-turn" },
          { kind: "become", target: "source", setColors: [], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CAMO_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: {
          type: "creature",
          controlledBy: "you",
          anyOf: [{ subtype: "Spider" }, { supertype: "legendary" }],
        },
        simultaneous: true,
        effect: { kind: "double-counters", target: 0 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Miles Morales", "Ultimate Spider-Man"],
});
