import { defineCard } from "../define.js";
import { partnerWithTrigger } from "../helpers.js";

const BLOCKED = "Madame Vastra must be blocked if able.";
const TOKENS = "Whenever a creature dealt damage by Madame Vastra this turn dies, create a Clue token and a Food token.";

export default defineCard({
  name: "Madame Vastra",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lizard", "Detective"],
  power: 3,
  toughness: 3,
  pairing: { kind: "partner-with", name: "Jenny Flint" },
  text: `Partner with Jenny Flint (When this creature enters, target player may put Jenny Flint into their hand from their library, then shuffle.)\n${BLOCKED}\n${TOKENS}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-be-blocked-if-able"],
      text: BLOCKED,
    },
  ],
  triggered: [
    partnerWithTrigger("Jenny Flint"),
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Clue Token", count: 1 },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: TOKENS,
    },
  ],
});
