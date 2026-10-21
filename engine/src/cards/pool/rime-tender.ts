import { defineCard } from "../define.js";

// EDHREC rank 11144.

const TEXT = "{T}: Untap another target snow permanent.";

export default defineCard({
  name: "Rime Tender",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { supertype: "snow" } } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
