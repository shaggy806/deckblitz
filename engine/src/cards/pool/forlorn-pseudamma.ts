import { defineCard } from "../define.js";

// EDHREC rank 25679.

const TEXT =
  "Inspired — Whenever this creature becomes untapped, you may pay {2}{B}. If you do, create a 2/2 black Zombie enchantment creature token.";

export default defineCard({
  name: "Forlorn Pseudamma",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  keywords: ["intimidate"],
  text: `Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to create a 2/2 Zombie token?",
        cost: "{2}{B}",
        effect: { kind: "create-token", token: "2/2 Black Enchantment Zombie Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
