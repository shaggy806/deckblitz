import { defineCard } from "../define.js";

// "Tokens you created": whoever creates a token owns it and has it enter under
// their control (rule 111.2), so the `entered` list's tokens are the ones they
// created, each of a stack counted (rule 111.1's "token" is a permanent).

export default defineCard({
  name: "Ellyn Harbreeze, Busybody",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 4,
  pairing: { kind: "choose-a-background" },
  text: "{T}: Look at the top X cards of your library, where X is the number of tokens you created this turn. Put one of those cards into your hand and the rest on the bottom of your library in a random order.\nChoose a Background (You can have a Background as a second commander.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { turnHistory: "entered", filter: { token: true } },
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "{T}: Look at the top X cards of your library, where X is the number of tokens you created this turn. Put one of those cards into your hand and the rest on the bottom of your library in a random order.",
    },
  ],
});
