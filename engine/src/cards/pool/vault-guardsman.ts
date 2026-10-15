import { defineCard } from "../define.js";

// EDHREC rank 29801.

const ETB_TEXT =
  "When this creature enters, exile target artifact or creature an opponent controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Vault Guardsman",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 4,
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      // The exile's linked return (rule 610.3).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this creature leaves the battlefield, return the exiled card.",
    },
  ],
});
