import { defineCard } from "../define.js";

// EDHREC rank 17983.

export default defineCard({
  name: "Robaran Mercenaries",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\nThis creature has all activated abilities of all legendary creatures you control.",
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: {
        zone: "battlefield",
        filter: { supertype: "legendary", type: "creature", controlledBy: "you" },
      },
      text: "This creature has all activated abilities of all legendary creatures you control.",
    },
  ],
});
