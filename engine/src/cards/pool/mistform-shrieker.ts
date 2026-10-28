import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 31624.

export default defineCard({
  name: "Mistform Shrieker",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{3}{U}{U}" },
  text: "Flying\n{1}: This creature becomes the creature type of your choice until end of turn.\nMorph {3}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "add-types",
          target: "source",
          setSubtypes: ["$chosen"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: "{1}: This creature becomes the creature type of your choice until end of turn.",
    },
  ],
});
