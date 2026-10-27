import { defineCard } from "../define.js";

export default defineCard({
  name: "Scuttling Sentinel",
  manaCost: "{1}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Crab", "Elf"],
  power: 3,
  toughness: 2,
  keywords: ["flash", "vigilance"],
  text: "Flash\nVigilance\nWhen this creature enters, put a +1/+1 counter on another target creature you control. Until end of turn, that creature becomes a blue Crab in addition to its other types and gains hexproof. (It can't be the target of spells or abilities your opponents control.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          // "Becomes a blue Crab": its colour becomes blue (rule 105.3), its
          // types gain Crab.
          { kind: "become-color", target: 0, colors: ["U"], duration: "end-of-turn" },
          { kind: "add-types", target: 0, addSubtypes: ["Crab"], duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on another target creature you control. Until end of turn, that creature becomes a blue Crab in addition to its other types and gains hexproof.",
    },
  ],
});
