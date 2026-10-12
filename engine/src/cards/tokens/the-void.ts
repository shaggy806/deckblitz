import { defineCard } from "../define.js";

/**
 * The Sentry, Golden Guardian's token — "The Void, a legendary 5/5 black
 * Horror Villain creature token with flying, indestructible, and 'The Void
 * attacks each combat if able.'" A named token whose name collides with no
 * card, so it's keyed by that name (Doombot's shape) and the legend rule
 * reads "The Void".
 */
export default defineCard({
  name: "The Void",
  art: "d656b085-fb86-4d2f-a4fc-b65f6ed9f001",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horror", "Villain"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "indestructible"],
  text: "Flying, indestructible\nThe Void attacks each combat if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "The Void attacks each combat if able.",
    },
  ],
});
