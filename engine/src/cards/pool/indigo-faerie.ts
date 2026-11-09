import { defineCard } from "../define.js";

// EDHREC rank 28394. Blue added to its other colours (layer 5, rule 105.3),
// not replacing them: `become`'s `inAddition`.

export default defineCard({
  name: "Indigo Faerie",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{U}: Target permanent becomes blue in addition to its other colors until end of turn.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: ["permanent"],
      effect: { kind: "become", target: 0, addColors: ["U"], duration: "end-of-turn" },
      resolve: null,
      text: "{U}: Target permanent becomes blue in addition to its other colors until end of turn.",
    },
  ],
});
