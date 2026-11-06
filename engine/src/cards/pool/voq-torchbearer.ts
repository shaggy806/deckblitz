import { defineCard } from "../define.js";

export default defineCard({
  name: "Voq, Torchbearer",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Spy"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: "Menace\nChoH'a' — You may have Voq enter as a copy of a creature card in a graveyard, except he's a Klingon Spy in addition to his other types and has menace.",
  copyOnEnter: {
    filter: { type: "creature" },
    from: "graveyards",
    except: { addSubtypes: ["Klingon", "Spy"], keywords: ["menace"] },
  },
});
