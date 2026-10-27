import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 16703.
//
// The Haunt of Hightower's trigger: cards only (a token isn't one), from any
// zone, once per card.

const TEXT = "Whenever a card is put into an opponent's graveyard from anywhere, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Vulturous Zombie",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Plant", "Zombie"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "opponent" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
