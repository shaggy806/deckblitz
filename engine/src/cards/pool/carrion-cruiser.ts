import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this Vehicle enters, mill two cards. Then return a creature or Vehicle card from your graveyard to your hand.";

export default defineCard({
  name: "Carrion Cruiser",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT} (To mill two cards, put the top two cards of your library into your graveyard.)\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)`,
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
      crew: true,
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 1,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
