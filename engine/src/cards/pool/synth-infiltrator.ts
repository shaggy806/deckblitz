import { defineCard } from "../define.js";

// Rulings: declining the copy leaves a 0/0 that dies; the copy is a Synth
// artifact creature in addition to the copied creature's types (rule 707.9b).
export default defineCard({
  name: "Synth Infiltrator",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Synth"],
  power: 0,
  toughness: 0,
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nYou may have this creature enter as a copy of any creature on the battlefield, except it's a Synth artifact creature in addition to its other types.",
  copyOnEnter: {
    filter: { type: "creature" },
    except: { addTypes: ["artifact", "creature"], addSubtypes: ["Synth"] },
  },
});
