import { defineCard } from "../define.js";

const TEXT =
  "As long as you control a Desert or there is a Desert card in your graveyard, this creature gets +1/+0 and has trample.";

export default defineCard({
  name: "Sidewinder Naga",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "any",
        of: [
          { kind: "controls", filter: { subtype: "Desert" }, atLeast: 1 },
          { kind: "cards-in-graveyard", atLeast: 1, filter: { subtype: "Desert" } },
        ],
      },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
