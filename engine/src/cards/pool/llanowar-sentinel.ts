import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may pay {1}{G}. If you do, search your library for a card named Llanowar Sentinel, put that card onto the battlefield, then shuffle.";

export default defineCard({
  name: "Llanowar Sentinel",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{G} to search for a Llanowar Sentinel?",
        cost: "{1}{G}",
        // A search for a named card may fail to find (the ruling): min 0.
        effect: {
          kind: "search-library",
          filter: { name: "Llanowar Sentinel" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
