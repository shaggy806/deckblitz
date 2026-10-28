import { defineCard } from "../define.js";

// EDHREC rank 3533.
//
// "Is a black Dragon": its colours set to black (layer 5) and its creature types
// replaced by Dragon (setSubtypes), its other card types kept. "Is goaded" is the
// static `goads` — this Aura's controller the goader, for as long as it's attached.
//
// Rulings:
//   [2025-06-06] Eye of Nidhogg overwrites all colors and creature types the enchanted creature
//     has. It's just a black Dragon. The creature keeps any supertypes it has (such as legendary),
//     as well as any other card types it has (such as enchantment).
//   [2025-06-06] Eye of Nidhogg overwrites all previous effects that set the creature's base power
//     and toughness to specific values. Any power- or toughness-setting effects that start to
//     apply afterward will overwrite this effect.
//   [2025-06-06] Being goaded isn't an ability the creature has. Once it's been goaded, it must
//     attack as detailed above even if it loses all abilities.

const RETURN_TEXT = "When Eye of Nidhogg is put into a graveyard from the battlefield, return it to its owner's hand.";

export default defineCard({
  name: "Eye of Nidhogg",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature is a black Dragon with base power and toughness 4/2, has flying and deathtouch, and is goaded. (It attacks each combat if able and attacks a player other than you if able.)\n${RETURN_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setColors: ["B"],
      setSubtypes: ["Dragon"],
      setBasePt: { power: 4, toughness: 2 },
      grantKeywords: ["flying", "deathtouch"],
      goads: true,
      text: "Enchanted creature is a black Dragon with base power and toughness 4/2, has flying and deathtouch, and is goaded.",
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
