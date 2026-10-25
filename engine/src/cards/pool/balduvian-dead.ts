import { defineCard } from "../define.js";

// EDHREC rank 31218. Alliances. Graf Harvest's cost and Hungry for More's
// delayed sacrifice: activated during the end step, after that step's
// triggers, the token lasts until the next turn's end step (the ruling — the
// delayed trigger waits for the *next* end step).

export default defineCard({
  name: "Balduvian Dead",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  text: "{2}{R}, Exile a creature card from your graveyard: Create a 3/1 black and red Graveborn creature token with haste. Sacrifice it at the beginning of the next end step.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Graveborn Token", count: 1 },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "created",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice it at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: "{2}{R}, Exile a creature card from your graveyard: Create a 3/1 black and red Graveborn creature token with haste. Sacrifice it at the beginning of the next end step.",
    },
  ],
});
