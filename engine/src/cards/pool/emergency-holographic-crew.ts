import { defineCard } from "../define.js";

// EDHREC rank 32613.

const ETB_TEXT = "When this creature enters, choose one —";

export default defineCard({
  name: "Emergency Holographic Crew",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Illusion", "Officer"],
  power: 3,
  toughness: 4,
  text: `${ETB_TEXT}\n• Return target Spacecraft card from your graveyard to your hand.\n• Surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Return target Spacecraft card from your graveyard to your hand.",
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { subtype: "Spacecraft" } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          { text: "Surveil 2.", effect: { kind: "surveil", amount: 2 } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
