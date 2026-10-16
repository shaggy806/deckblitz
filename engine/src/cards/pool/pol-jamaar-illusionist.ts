import { defineCard } from "../define.js";

// EDHREC rank 13731. The type is chosen as the trigger resolves (the ruling),
// as Distant Melody's — counting creatures only.

const ETB_TEXT =
  "When Pol Jamaar enters, choose a creature type. Draw a card for each creature you control of that type.";

export default defineCard({
  name: "Pol Jamaar, Illusionist",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Illusion", "Wizard"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "draw",
          amount: { countOf: { type: "creature", controlledBy: "you", subtype: "$chosen" } },
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
