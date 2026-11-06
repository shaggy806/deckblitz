import { defineCard } from "../define.js";

const TEXT = "Historic creatures you control have flying. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "On the Shoulders of Giants",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: {
        scope: "filter",
        filter: {
          type: "creature",
          controlledBy: "you",
          anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }],
        },
      },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
