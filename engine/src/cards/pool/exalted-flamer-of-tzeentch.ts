import { defineCard } from "../define.js";

// EDHREC rank 3234. Sorcerous Inspiration picks at random as it resolves
// (`choose-random-card`), so nothing is targeted.

const INSPIRATION =
  "Sorcerous Inspiration — At the beginning of your upkeep, return an instant or sorcery card at random from your graveyard to your hand.";
const FIRE = "Fire of Tzeentch — Whenever you cast an instant or sorcery spell, this creature deals 1 damage to each opponent.";

export default defineCard({
  name: "Exalted Flamer of Tzeentch",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 2,
  toughness: 4,
  text: `${INSPIRATION}\n${FIRE}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        then: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: INSPIRATION,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: FIRE,
    },
  ],
});
