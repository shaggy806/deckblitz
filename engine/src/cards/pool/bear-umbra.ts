import { defineCard } from "../define.js";

// EDHREC rank 899.

const GRANT_TEXT = 'Enchanted creature gets +2/+2 and has "Whenever this creature attacks, untap all lands you control."';

export default defineCard({
  name: "Bear Umbra",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: `Enchant creature\n${GRANT_TEXT}\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)`,
  targets: ["creature"],
  static: [
    {
      // The granted trigger is the creature's, so "you" is its controller,
      // not necessarily the Aura's (the rulings).
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: { kind: "untap-all", filter: { type: "land", controlledBy: "you" } },
          resolve: null,
          text: "Whenever this creature attacks, untap all lands you control.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
