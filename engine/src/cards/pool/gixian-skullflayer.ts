import { defineCard } from "../define.js";

// The Brothers' War. An intervening-if (rule 603.4): the creature cards in
// your graveyard are counted as the upkeep begins and again as the trigger
// resolves (the ruling).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, if there are three or more creature cards in your graveyard, " +
  "put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Gixian Skullflayer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Human", "Assassin"],
  power: 2,
  toughness: 3,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "cards-in-graveyard", atLeast: 3, filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
