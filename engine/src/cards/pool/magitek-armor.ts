import { defineCard } from "../define.js";

export default defineCard({
  name: "Magitek Armor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: "When this Vehicle enters, create a 1/1 colorless Hero creature token.\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
      resolve: null,
      text: "When this Vehicle enters, create a 1/1 colorless Hero creature token.",
    },
  ],
});
