import { defineCard } from "../define.js";

// Invasion.
//
// Rulings:
//   [2004-10-04] This does not change the amount of mana gained. It just makes all the mana generated
//     by the basic land be of a single color of your choice.
//   [2004-10-04] You can choose a different color each time a basic land is tapped.
//   [2004-10-04] You can choose the same color or mana the land would normally produce.
//
// `landManaInstead`'s `"any-color"`: the choice comes with the tap, as a five-colour land's does.

const TEXT = "If a basic land you control is tapped for mana, it produces mana of a color of your choice instead of any other type.";

export default defineCard({
  name: "Pulse of Llanowar",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      landManaInstead: [{ filter: { supertype: "basic", controlledBy: "you" }, produces: "any-color", tapper: "any" }],
      text: TEXT,
    },
  ],
});
