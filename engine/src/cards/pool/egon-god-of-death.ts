import { defineCard } from "../define.js";

// EDHREC rank 11374. Kaldheim. A modal DFC; the back face is Throne of Death.
//
// "Exile two cards from your graveyard. If you can't, sacrifice Egon and draw
// a card": with two or more there, two must be exiled (chosen as it
// resolves); with fewer, none is, and Egon is sacrificed — the draw happens
// even if Egon has already left the battlefield (the rulings).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, exile two cards from your graveyard. If you can't, sacrifice Egon and draw a card.";

export default defineCard({
  name: "Egon, God of Death",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 6,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2 },
        then: {
          kind: "look-and-choose",
          zone: "graveyard",
          min: 2,
          max: 2,
          destination: "exile",
          leftover: "stay",
        },
        else: {
          kind: "sequence",
          effects: [{ kind: "sacrifice-source" }, { kind: "draw", amount: 1 }],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Egon, God of Death", "Throne of Death"],
});
