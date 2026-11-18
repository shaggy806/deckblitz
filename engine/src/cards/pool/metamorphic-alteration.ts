import { defineCard } from "../define.js";

// EDHREC rank 14667.
//
// "As this Aura enters, choose a creature" (rule 614.1c) is `choosePermanentOnEnter`:
// any creature already on the battlefield, the one it will enchant included, never
// one entering with it (the rulings). Its copiable values are locked in as it's
// chosen (`chosenCopy`): what it's copying if it's a copy, a token's original
// values, never its counters or other effects, and nothing it becomes or does
// later (the rulings). The static's copy effect follows the Aura from creature to
// creature (`copyOfChosen`): a copy of a noncreature makes the Aura fall off, and
// the creature is itself again (the ruling).

const COPY_TEXT = "Enchanted creature is a copy of the chosen creature.";

export default defineCard({
  name: "Metamorphic Alteration",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nAs this Aura enters, choose a creature.\n${COPY_TEXT}`,
  targets: ["creature"],
  choosePermanentOnEnter: {
    filter: { type: "creature" },
    prompt: "Choose a creature for the enchanted creature to be a copy of",
  },
  static: [
    {
      affects: { scope: "attached" },
      copyOfChosen: true,
      text: COPY_TEXT,
    },
  ],
});
