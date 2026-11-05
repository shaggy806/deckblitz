import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When Lutri enters, if you cast it, copy target instant or sorcery spell you control. You may choose new targets for the copy.";

export default defineCard({
  name: "Lutri, the Spellchaser",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Otter"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text:
    "Companion — Each nonland card in your starting deck has a different name. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\n" +
    `Flash\n${ENTER_TEXT}`,
  companion: { kind: "different-names", of: "nonland" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
