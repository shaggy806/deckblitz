import { defineCard } from "../define.js";
import { reconfigure } from "../helpers.js";

const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT =
  "As long as The Reality Chip is attached to a creature, you may play lands and cast spells from the top of your library.";

export default defineCard({
  name: "The Reality Chip",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Equipment", "Jellyfish"],
  power: 0,
  toughness: 4,
  text: `${LOOK_TEXT}\n${PLAY_TEXT}\nReconfigure {2}{U} ({2}{U}: Attach to target creature you control; or unattach from a creature. Reconfigure only as a sorcery. While attached, this isn't a creature.)`,
  static: [
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK_TEXT },
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      playFromLibraryTop: { type: "land" },
      castFromLibraryTop: { filter: {} },
      text: PLAY_TEXT,
    },
  ],
  activated: reconfigure("{2}{U}"),
});
