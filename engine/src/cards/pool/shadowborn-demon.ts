import { defineCard } from "../define.js";

const ETB = "When this creature enters, destroy target non-Demon creature.";
const UPKEEP =
  "At the beginning of your upkeep, if there are fewer than six creature cards in your graveyard, sacrifice a creature.";

// The upkeep "if" is an intervening-if (the ruling): asked as it triggers and again as it resolves.
export default defineCard({
  name: "Shadowborn Demon",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${ETB}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Demon"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ETB,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "not", of: { kind: "cards-in-graveyard", atLeast: 6, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
