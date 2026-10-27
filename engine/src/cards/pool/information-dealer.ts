import { defineCard } from "../define.js";

const TEXT =
  "{T}: Look at the top X cards of your library, where X is the number of Wizards on the battlefield, then put them back in any order.";

// Every Wizard on the battlefield, anyone's, this one included.
const WIZARDS = { countOf: { subtype: "Wizard" } } as const;

export default defineCard({
  name: "Information Dealer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: WIZARDS,
        min: WIZARDS,
        max: WIZARDS,
        destination: "library-top",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
