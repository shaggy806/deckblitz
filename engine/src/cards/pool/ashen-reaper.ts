import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, put a +1/+1 counter on this creature if a permanent was put into a graveyard from the battlefield this turn.";

// Checked as it resolves, not as an intervening if: a permanent put into a
// graveyard in response counts (the ruling), a token too.
export default defineCard({
  name: "Ashen Reaper",
  art: "https://cards.scryfall.io/art_crop/back/a/e/ae2e1244-f05b-45f9-8afc-59f190524798.jpg",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie", "Elemental"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-history", what: "to-graveyard", who: "any-player", from: ["battlefield"] },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Invasion of Azgol", "Ashen Reaper"],
  transform: true,
});
