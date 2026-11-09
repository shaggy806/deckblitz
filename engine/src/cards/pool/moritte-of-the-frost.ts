import { defineCard } from "../define.js";

// "If it's a creature" reads what it copied (rule 707.9a): a copy of a
// noncreature permanent is legendary and snow, and that's all.
export default defineCard({
  name: "Moritte of the Frost",
  manaCost: "{2}{G}{U}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary", "snow"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  power: 0,
  toughness: 0,
  text: "Changeling (This card is every creature type.)\nYou may have Moritte enter as a copy of a permanent you control, except it's legendary and snow in addition to its other types and, if it's a creature, it enters with two additional +1/+1 counters on it and has changeling.",
  copyOnEnter: {
    filter: { controlledBy: "you" },
    except: {
      addSupertypes: ["legendary", "snow"],
      ifCopied: [{ ofType: "creature", patch: { keywords: ["changeling"] } }],
    },
    counters: [{ kind: "+1/+1", amount: 2, ifType: "creature" }],
  },
});
