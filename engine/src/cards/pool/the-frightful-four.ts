import { defineCard } from "../define.js";

// EDHREC rank 13171. Marvel Super Heroes Commander.
//
// The spell's mana value is read as the ability resolves — on the stack its
// {X} counts (rule 202.3e), or as it last existed if it has left.

const TEXT =
  "Whenever an opponent casts their first noncreature spell each turn, that player loses life equal to that spell's mana value.";

export default defineCard({
  name: "The Frightful Four",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Villain"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", firstEachTurn: true, filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "lose-life", amount: { manaValueOf: "trigger-object" }, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
