import { defineCard } from "../define.js";

// EDHREC rank 2663.
//
// "+1/-1 or -1/+1" isn't a modal ability (rule 700.2): the choice is made as
// the ability resolves (rule 608.2d) — Argivian Avenger's resolution-time
// `modal`.

const SHIFT = "{1}: Enchanted creature gets +1/-1 or -1/+1 until end of turn.";

export default defineCard({
  name: "Pemmin's Aura",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n{U}: Untap enchanted creature.\n{U}: Enchanted creature gains flying until end of turn.\n{U}: Enchanted creature gains shroud until end of turn. (It can't be the target of spells or abilities.)\n${SHIFT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: "{U}: Untap enchanted creature.",
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{U}: Enchanted creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "attached", keyword: "shroud", duration: "end-of-turn" },
      resolve: null,
      text: "{U}: Enchanted creature gains shroud until end of turn.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "+1/-1",
            effect: { kind: "modify-pt", target: "attached", power: 1, toughness: -1, duration: "end-of-turn" },
          },
          {
            text: "-1/+1",
            effect: { kind: "modify-pt", target: "attached", power: -1, toughness: 1, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: SHIFT,
    },
  ],
});
