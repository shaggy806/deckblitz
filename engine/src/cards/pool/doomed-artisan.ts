import { defineCard } from "../define.js";

// EDHREC rank 17697. Sculpture is a creature type (the ruling); the token's
// */* is its own CDA (tokens/sculpture-token.ts), counting itself.

const RESTRICT_TEXT = "Sculptures you control can't attack or block.";
const END_TEXT =
  'At the beginning of your end step, create a colorless Sculpture artifact creature token with "This token\'s power and toughness are each equal to the number of Sculptures you control."';

export default defineCard({
  name: "Doomed Artisan",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: `${RESTRICT_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sculpture" },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Sculpture Token", count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
