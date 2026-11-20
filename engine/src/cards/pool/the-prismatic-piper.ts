import { defineCard } from "../define.js";

// Its first ability is `chooseColorAsCommander`: the colour is chosen as the
// deck is built (rule 903.4b — `DeckList.commanderColors`), part of the
// deck's colour identity and the Piper's colour in every zone all game. In
// the 99 it makes no choice and stays colourless.
export default defineCard({
  name: "The Prismatic Piper",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  chooseColorAsCommander: true,
  pairing: { kind: "partner" },
  text: "If The Prismatic Piper is your commander, choose a color before the game begins. The Prismatic Piper is the chosen color.\nPartner (You can have two commanders if both have partner.)",
});
