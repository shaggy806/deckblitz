import { defineCard } from "../define.js";

// Two separate reductions, so a spell that's both white and blue costs {2}
// less (2006-05-01 ruling); each reduces only the generic part.
export default defineCard({
  name: "Grand Arbiter Augustin IV",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 3,
  text:
    "White spells you cast cost {1} less to cast.\n" +
    "Blue spells you cast cost {1} less to cast.\n" +
    "Spells your opponents cast cost {1} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["W"] }, reduceGeneric: 1, when: { caster: "you" } },
      text: "White spells you cast cost {1} less to cast.",
    },
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["U"] }, reduceGeneric: 1, when: { caster: "you" } },
      text: "Blue spells you cast cost {1} less to cast.",
    },
    {
      affects: { scope: "self" },
      costModification: { applies: {}, increaseGeneric: 1, when: { caster: "opponent" } },
      text: "Spells your opponents cast cost {1} more to cast.",
    },
  ],
});
