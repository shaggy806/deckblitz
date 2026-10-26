import { defineCard } from "../define.js";

// EDHREC rank 18824. Haunted Fengraf's random return, over Zombie cards.

const TEXT = "When this creature enters, return a Zombie card at random from your graveyard to your hand.";

export default defineCard({
  name: "Ghoulraiser",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        filter: { subtype: "Zombie" },
        then: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
