import { defineCard } from "../define.js";

// "Each time you've cast a commander from the command zone this game" counts
// as the trigger resolves, so a Jirina cast as a commander counts the cast
// that put her here (her ruling).

export default defineCard({
  name: "Jirina Kudro",
  manaCost: "{1}{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: "When Jirina Kudro enters, create a 1/1 white Human Soldier creature token for each time you've cast a commander from the command zone this game.\nOther Humans you control get +2/+0.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: { commanderCasts: "you" } },
      resolve: null,
      text: "When Jirina Kudro enters, create a 1/1 white Human Soldier creature token for each time you've cast a commander from the command zone this game.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Human", excludeSelf: true },
      grantPt: [2, 0],
      text: "Other Humans you control get +2/+0.",
    },
  ],
});
