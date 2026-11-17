import { defineCard } from "../define.js";

// Eventide (EVE).
//
// Sleight of Mind's text change (lasting indefinitely) on a spell or a permanent, with retrace: a
// token one of its changed abilities creates is the changed colour (rule 612.4, `tokenTextChanges`).

export default defineCard({
  name: "Glamerdye",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  retrace: true,
  text:
    "Change the text of target spell or permanent by replacing all instances of one color word with another.\n" +
    "Retrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: [{ kind: "spell-or-permanent" }],
  effect: { kind: "change-text", target: 0, words: "color", duration: "permanent" },
});
