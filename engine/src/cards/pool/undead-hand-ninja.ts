import { defineCard } from "../define.js";

// EDHREC rank 18072. Marvel Super Heroes Commander.
//
// Desecrated Tomb's trigger — once per batch of creature cards leaving, not
// once per card — with Retreat to Hagra's drain.
const DRAIN_TEXT =
  "Whenever one or more creature cards leave your graveyard, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Undead Hand Ninja",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Ninja", "Villain"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
