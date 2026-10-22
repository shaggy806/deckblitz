import { defineCard } from "../define.js";

// EDHREC rank 17286. Hour of Devastation. Exert is part of the second
// ability's cost (rule 701.43), payable even when it's already exerted (the
// ruling).
export default defineCard({
  name: "Hope Tender",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 2,
  toughness: 2,
  text: "{1}, {T}: Untap target land.\n{1}, {T}, Exert this creature: Untap two target lands. (An exerted creature won't untap during your next untap step.)",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["land"],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{1}, {T}: Untap target land.",
    },
    {
      cost: { mana: "{1}", tap: true, exertSelf: true },
      targets: ["land", { kind: "other", of: "land", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: "{1}, {T}, Exert this creature: Untap two target lands.",
    },
  ],
});
