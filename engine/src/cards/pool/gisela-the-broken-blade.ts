import { defineCard } from "../define.js";

// EDHREC rank 2550.

export default defineCard({
  name: "Gisela, the Broken Blade",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel", "Horror"],
  meldCard: true,
  power: 4,
  toughness: 3,
  keywords: ["flying", "first-strike", "lifelink"],
  text: "Flying, first strike, lifelink\nAt the beginning of your end step, if you both own and control Gisela and a creature named Bruna, the Fading Light, exile them, then meld them into Brisela, Voice of Nightmares.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "meld",
        partner: { name: "Bruna, the Fading Light", type: "creature" },
        into: "Brisela, Voice of Nightmares",
      },
      resolve: null,
      text: "At the beginning of your end step, if you both own and control Gisela and a creature named Bruna, the Fading Light, exile them, then meld them into Brisela, Voice of Nightmares.",
      condition: { kind: "meld-ready", partner: { name: "Bruna, the Fading Light", type: "creature" } },
    },
  ],
});
