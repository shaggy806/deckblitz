import { defineCard } from "../define.js";

const PARTNER =
  "Partner with Timin, Youthful Geist (When this creature enters, target player may put Timin into their hand from their library, then shuffle.)";
const TAPPED =
  "Whenever a creature an opponent controls becomes tapped, if it isn't being declared as an attacker, put a +1/+1 counter on Rhoda.";

export default defineCard({
  name: "Rhoda, Geist Avenger",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  pairing: { kind: "partner-with", name: "Timin, Youthful Geist" },
  text: `${PARTNER}\nVigilance\n${TAPPED}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Search your library for a card named Timin, Youthful Geist?",
        effect: {
          kind: "search-library",
          filter: { name: "Timin, Youthful Geist" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: PARTNER,
    },
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { type: "creature", controlledBy: "opponent" }, notAttacking: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TAPPED,
    },
  ],
});
