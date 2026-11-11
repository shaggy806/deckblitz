import { defineCard } from "../define.js";

// EDHREC rank 9148. "Enter or attack" is one ability with two trigger events
// (`sameAbilityAs`); X counts each tapped permanent that's an artifact, a
// creature or both once, as it resolves.

const TEXT =
  "Whenever Aang and Katara enter or attack, create X 1/1 white Ally creature tokens, where X is the number of tapped artifacts and/or creatures you control.";
const TOKENS = {
  kind: "create-token",
  token: "Ally Token",
  count: { countOf: { typesAnyOf: ["artifact", "creature"], tapped: true, controlledBy: "you" } },
} as const;

export default defineCard({
  name: "Aang and Katara",
  manaCost: "{3}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Avatar", "Ally"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      sameAbilityAs: 1,
      targets: [],
      effect: TOKENS,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: TOKENS,
      resolve: null,
      text: TEXT,
    },
  ],
});
