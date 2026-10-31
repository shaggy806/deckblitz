import { defineCard } from "../define.js";

// A processor (Battle for Zendikar): "put a card an opponent owns from exile
// into that player's graveyard" is a `look-and-choose` over the exile zone
// (`ownedBy: "opponent"`, to its owner's graveyard); "If you do" reads the
// card chosen (`this-way: "chosen"`), so it holds though Rest in Peace exiles
// the card again (the ruling). The target is chosen as the trigger goes on
// the stack; the card from exile, as it resolves.

const ETB_TEXT =
  "When this creature enters, you may put a card an opponent owns from exile into that player's graveyard. If you do, target creature gets -3/-3 until end of turn.";

export default defineCard({
  name: "Wasteland Strangler",
  manaCost: "{2}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 3,
  toughness: 2,
  text: `Devoid (This card has no color.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Put a card an opponent owns from exile into their graveyard?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "look-and-choose",
              zone: "exile",
              filter: { ownedBy: "opponent" },
              min: 1,
              max: 1,
              destination: "graveyard",
              leftover: "stay",
            },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "chosen" },
              then: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
            },
          ],
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
