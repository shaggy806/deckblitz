import { defineCard } from "../define.js";

// EDHREC rank 16672.
// The two cards are two fixed slots, the second from the first's graveyard: it can't be activated
// unless one opponent has two cards to target (the ruling). Both cards gone by resolution still
// leaves the attacking creature's destruction (the other ruling).

const ACTIVATED_TEXT =
  "{T}: Return two target cards from an opponent's graveyard to their hand. Destroy target attacking creature.";

export default defineCard({
  name: "Spurnmage Advocate",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 1,
  toughness: 1,
  text: ACTIVATED_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        { kind: "card-in-graveyard", whose: "opponent" },
        {
          kind: "other",
          of: { kind: "card-in-graveyard", whose: "opponent" },
          than: { slot: 0 },
          sameController: true,
        },
        { kind: "permanent", filter: { attacking: true, type: "creature" } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "return-to-hand", target: 0, from: "graveyard" },
              { kind: "return-to-hand", target: 1, from: "graveyard" },
            ],
          },
          { kind: "destroy", target: 2 },
        ],
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
});
