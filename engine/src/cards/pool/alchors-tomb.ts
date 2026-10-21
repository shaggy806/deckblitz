import { defineCard } from "../define.js";
import type { ModeOption } from "../../effects.js";
import type { Color } from "../../mana.js";

// Legends. EDHREC rank 29524.
//
// The colour is chosen as the ability resolves — an unannounced `modal`, one
// mode per colour (Wash Out's "of your choice" shape). The permanent becomes
// that one colour only, for good (layer 5 — `become-color`).
const become = (color: Color, word: string): ModeOption => ({
  text: word,
  effect: { kind: "become-color", target: 0, colors: [color], duration: "permanent" },
});

export default defineCard({
  name: "Alchor's Tomb",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Target permanent you control becomes the color of your choice. (This effect lasts indefinitely.)",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [become("W", "White"), become("U", "Blue"), become("B", "Black"), become("R", "Red"), become("G", "Green")],
      },
      resolve: null,
      text: "{2}, {T}: Target permanent you control becomes the color of your choice.",
    },
  ],
});
