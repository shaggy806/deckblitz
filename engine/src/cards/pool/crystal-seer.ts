import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 30965. Inkfathom Divers' look, and a bounce.

const ETB = "When this creature enters, look at the top four cards of your library, then put them back in any order.";
const BOUNCE = "{4}{U}: Return this creature to its owner's hand.";

export default defineCard({
  name: "Crystal Seer",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ETB}\n${BOUNCE}`,
  activated: [
    {
      cost: { mana: "{4}{U}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 4,
        max: 4,
        destination: "library-top",
        leftover: "stay",
      },
      resolve: null,
      text: ETB,
    },
  ],
});
