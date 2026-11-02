import { defineCard } from "../define.js";

// Rulings:
//   Players make their choices in turn order and get to know what choices were made before theirs.
//   They may choose an artifact or an enchantment that was already chosen by another player. Once
//   all players have made their choices, the permanents are destroyed simultaneously.

const TEXT =
  "When this creature enters, starting with you, each player may choose an artifact or enchantment you don't control. Destroy each permanent chosen this way.";

export default defineCard({
  name: "Druid of Purification",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            startingWith: "you",
            for: { permanent: { typesAnyOf: ["artifact", "enchantment"], controlledBy: "opponent" }, upTo: 1 },
          },
          { kind: "destroy-all", filter: { thisWay: "chosen" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
