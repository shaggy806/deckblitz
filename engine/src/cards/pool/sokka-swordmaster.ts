import { defineCard } from "../define.js";

// EDHREC rank 13907. Its ruling: Sokka counts himself as an Ally.

export default defineCard({
  name: "Sokka, Swordmaster",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\nEquipment spells you cast cost {1} less to cast for each Ally you control.\nAt the beginning of combat on your turn, attach up to one target Equipment you control to Sokka.",
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { subtype: "Equipment" },
        reduceGeneric: { countOf: { subtype: "Ally", controlledBy: "you" } },
        when: { caster: "you" },
      },
      text: "Equipment spells you cast cost {1} less to cast for each Ally you control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } } }],
      effect: { kind: "attach", target: "source", attachment: 0 },
      resolve: null,
      text: "At the beginning of combat on your turn, attach up to one target Equipment you control to Sokka.",
    },
  ],
});
