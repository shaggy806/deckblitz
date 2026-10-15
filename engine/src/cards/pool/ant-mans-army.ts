import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, create a Food token or a Treasure token.";

export default defineCard({
  name: "Ant-Man's Army",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 2,
  text: `${ENTERS_TEXT} (A Food token is an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life." A Treasure token is an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Create a Food token.", effect: { kind: "create-token", token: "Food Token", count: 1 } },
          { text: "Create a Treasure token.", effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
