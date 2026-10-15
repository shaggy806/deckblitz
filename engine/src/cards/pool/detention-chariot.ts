import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this Vehicle enters, exile target artifact or creature an opponent controls until this Vehicle leaves the battlefield.";

export default defineCard({
  name: "Detention Chariot",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  cycling: { cost: "{W}" },
  text: `${ENTER_TEXT}\nCrew 3 (Tap any number of creatures you control with total power 3 or more: This Vehicle becomes an artifact creature until end of turn.)\nCycling {W} ({W}, Discard this card: Draw a card.)`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 3, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 3",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // The exile's linked return (rule 610.3).
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source" },
      resolve: null,
      text: "When this Vehicle leaves the battlefield, return the exiled card.",
    },
  ],
});
