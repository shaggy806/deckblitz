import { defineCard } from "../define.js";

// A processor of two: `needsMin` makes it all or nothing — with only one card
// an opponent owns in exile, none is put and nothing is countered (a cost
// can't be paid in part, rule 118.3). The two may be different opponents'
// (the ruling).

const ETB_TEXT =
  "When this creature enters, you may put two cards your opponents own from exile into their owners' graveyards. If you do, counter target spell.";

export default defineCard({
  name: "Ulamog's Nullifier",
  manaCost: "{2}{U}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 2,
  toughness: 3,
  keywords: ["flash", "flying"],
  text: `Devoid (This card has no color.)\nFlash\nFlying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["spell"],
      effect: {
        kind: "may",
        prompt: "Put two cards your opponents own from exile into their graveyards?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "exile",
              filter: { ownedBy: "opponent" },
              min: 2,
              max: 2,
              needsMin: true,
              destination: "graveyard",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "chosen", atLeast: 2 },
              then: { kind: "counter", target: 0 },
            },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
