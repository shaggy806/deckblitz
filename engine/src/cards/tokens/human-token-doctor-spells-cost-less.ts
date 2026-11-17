import { defineCard } from "../define.js";

// The 1/1 white Human of The Eleventh Hour: "Doctor spells you cast cost {1}
// less to cast" — a spell with the creature type Doctor (its ruling), the
// Heartless Summoning shape.
export default defineCard({
  name: "Human Token (Doctor spells you cast cost {1} less)",
  art: "30fe939f-c680-403f-a5be-0f0cca020ef2",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: "Doctor spells you cast cost {1} less to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Doctor" }, reduceGeneric: 1, when: { caster: "you" } },
      text: "Doctor spells you cast cost {1} less to cast.",
    },
  ],
});
