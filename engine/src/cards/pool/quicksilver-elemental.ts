import { defineCard } from "../define.js";

// The abilities gathered are this creature's own for as long as they last (the
// ruling): "this permanent" in them is this creature, and they're what the blue mana
// may pay for, along with its printed one.
const GAIN_TEXT = "{U}: This creature gains all activated abilities of target creature until end of turn. (If any of the abilities use that creature's name, use this creature's name instead.)";
const SPEND_TEXT =
  "You may spend blue mana as though it were mana of any color to pay the activation costs of this creature's abilities.";

export default defineCard({
  name: "Quicksilver Elemental",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 4,
  text: `${GAIN_TEXT}\n${SPEND_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-activated-of", target: "source", of: 0, duration: "end-of-turn" },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      spendManaAs: { as: { unit: "U", as: "any-color" }, activating: "this" },
      text: SPEND_TEXT,
    },
  ],
});
