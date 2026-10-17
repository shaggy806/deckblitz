import { defineCard } from "../define.js";

const PLATFORM_TEXT =
  "Whenever you attack, exile target nonland card from your graveyard with two time counters on it. If it doesn't have suspend, it gains suspend.";

export default defineCard({
  name: "Doom's Time Platform",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${PLATFORM_TEXT} (At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. If it's a creature, it has haste.)`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["land"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "give-suspend", timeCounters: 2 },
        ],
      },
      resolve: null,
      text: PLATFORM_TEXT,
    },
  ],
});
