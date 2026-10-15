import { defineCard } from "../define.js";

// EDHREC rank 18396.
//
// Taskmaster's shape: he copies the target's copiable values as the ability
// resolves (rule 707.2) — its colours too, since the exceptions don't name
// them — until his controller's next turn begins. His name, legendary, the
// creature type and Human Villain, base 4/4 and vigilance are copiable
// exceptions (rule 707.9b). He doesn't keep this ability while he's a copy,
// and doesn't need it: the copy ends as his next turn begins, before his
// first main phase. With no target chosen nothing happens.
const COPY_TEXT =
  "At the beginning of your first main phase, until your next turn, Absorbing Man becomes a copy of up to one target artifact, non-Aura enchantment, or land, except his name is Absorbing Man, he's a legendary 4/4 Human Villain creature in addition to his other types, and he has vigilance.";

export default defineCard({
  name: "Absorbing Man",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "permanent",
            filter: {
              anyOf: [{ type: "artifact" }, { type: "enchantment", notSubtypes: ["Aura"] }, { type: "land" }],
            },
          },
        },
      ],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        until: "your-next-turn",
        exceptions: {
          name: "Absorbing Man",
          addSupertypes: ["legendary"],
          addTypes: ["creature"],
          addSubtypes: ["Human", "Villain"],
          basePt: [4, 4],
          keywords: ["vigilance"],
        },
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
