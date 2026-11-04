import { defineCard } from "../define.js";

// A face-down creature is colorless (rule 708.2a), so what it cloaks is counted
// by its other mode.
const TEXT =
  "At the beginning of combat on your turn, choose one —\n• Cloak a card from your hand. (Put it onto the battlefield face down as a 2/2 creature with ward {2}. Turn it face up any time for its mana cost if it's a creature card.)\n• Put a +1/+1 counter on each colorless creature you control.";

export default defineCard({
  name: "Vannifar, Evolved Enigma",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elf", "Ooze", "Wizard"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Cloak a card from your hand.",
            effect: { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "cloak", leftover: "stay" },
          },
          {
            text: "Put a +1/+1 counter on each colorless creature you control.",
            effect: {
              kind: "add-counter-all",
              filter: { type: "creature", controlledBy: "you", colorless: true },
              counter: "+1/+1",
              amount: 1,
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
