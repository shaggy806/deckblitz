import { defineCard } from "../define.js";

// The card is chosen at random as the ability resolves, with no target (the
// rulings) — Exalted Flamer of Tzeentch's shape.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, return an instant or sorcery card at random from your graveyard to your hand.";
const CAST_TEXT = "Whenever you cast an instant or sorcery spell, this creature gets +4/+0 until end of turn.";

export default defineCard({
  name: "Charmbreaker Devils",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 4,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n${CAST_TEXT}`,
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
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 4, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
