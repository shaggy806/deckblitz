import { defineCard } from "../define.js";

// EDHREC rank 12394.
// Makes Zombie → use "Zombie Token".

export default defineCard({
  name: "Gravedig",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "entwine" },
  text: "Choose one —\n• Target player creates a 2/2 black Zombie creature token.\n• Return target creature card from your graveyard to your hand.\nEntwine {2} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: 2,
    modes: [
      {
        text: "Target player creates a 2/2 black Zombie creature token.",
        targets: ["player"],
        effect: { kind: "create-token", token: "Zombie Token", count: 1, who: "target-controller" },
      },
      {
        text: "Return target creature card from your graveyard to your hand.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
    ],
  },
});
