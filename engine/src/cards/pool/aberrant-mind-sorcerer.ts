import { defineCard } from "../define.js";

// EDHREC rank 14591.
//
// The card is targeted as the trigger goes on the stack and the d20 is
// rolled as it resolves (the ruling); a target gone from the graveyard by
// then makes the whole ability do nothing.
const PSIONIC_TEXT =
  "Psionic Spells — When this creature enters, choose target instant or sorcery card in your graveyard, then roll a d20.\n1—9 | You may put that card on top of your library.\n10—20 | Return that card to your hand.";

export default defineCard({
  name: "Aberrant Mind Sorcerer",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Shaman", "Sorcerer"],
  power: 3,
  toughness: 4,
  text: PSIONIC_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          {
            min: 1,
            max: 9,
            effect: {
              kind: "may",
              prompt: "Put that card on top of your library?",
              effect: { kind: "put-on-library", target: 0, position: "top" },
            },
          },
          { min: 10, max: 20, effect: { kind: "return-to-hand", target: 0, from: "graveyard" } },
        ],
      },
      resolve: null,
      text: PSIONIC_TEXT,
    },
  ],
});
