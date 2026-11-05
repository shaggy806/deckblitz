import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of each opponent's upkeep, you manifest the top card of that player's library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";
const DIES_TEXT = "Whenever a creature you control but don't own dies, its owner loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Thieving Amalgam",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Ape", "Snake"],
  power: 6,
  toughness: 7,
  text: `${UPKEEP_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: { kind: "manifest", who: "you", from: "active-player" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", ownedBy: "opponent" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "trigger-owner" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
