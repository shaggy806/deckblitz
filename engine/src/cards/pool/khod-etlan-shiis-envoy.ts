import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Stormtide Leviathan's Islands and a
// lord over five creature types.

const LORD = "Other Homarids, Camarids, Cephalids, Nautilids, and Merfolk you control get +1/+1.";

export default defineCard({
  name: "Khod, Etlan Shiis Envoy",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Homarid", "Warrior"],
  power: 2,
  toughness: 3,
  text: `All lands are Islands in addition to their other types.\n${LORD}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      addSubtypes: ["Island"],
      text: "All lands are Islands in addition to their other types.",
    },
    {
      affects: {
        scope: "filter",
        filter: {
          type: "creature",
          subtypes: ["Homarid", "Camarid", "Cephalid", "Nautilid", "Merfolk"],
          controlledBy: "you",
        },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: LORD,
    },
  ],
});
