import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// Tapped only if it copies (rule 707.9e; its ruling: declining, it enters
// untapped as itself, with its own mana ability).
export default defineCard({
  name: "Echoing Deeps",
  colors: [],
  types: ["land"],
  subtypes: ["Cave"],
  text:
    "You may have this land enter tapped as a copy of any land card in a graveyard, except it's a Cave in addition to its other types.\n" +
    "{T}: Add {C}.",
  copyOnEnter: {
    filter: { type: "land" },
    from: "graveyards",
    tapped: true,
    except: { addSubtypes: ["Cave"] },
  },
  activated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
});
