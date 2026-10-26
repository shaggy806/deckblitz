import { defineCard } from "../define.js";

// EDHREC rank 30802.
// Every noncreature artifact, whoever controls it, while this is untapped.

const TEXT =
  "As long as this creature is untapped, noncreature artifacts have shroud. (They can't be the targets of spells or abilities.)";

export default defineCard({
  name: "Spectral Guardian",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", notTypes: ["creature"] } },
      condition: { kind: "source", filter: { tapped: false } },
      grantKeywords: ["shroud"],
      text: TEXT,
    },
  ],
});
