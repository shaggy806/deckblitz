import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 28043. Dormant Sliver's granted
// enters trigger, twice: the creature that enters is the damage's source. A
// creature with no creature type is non-Spirit (the ruling).
const SPIRITS =
  'All Spirits have "When this permanent enters, you may have it deal 3 damage to target non-Spirit creature."';
const OTHERS =
  'Non-Spirit creatures have "When this creature enters, you may have it deal 3 damage to target Spirit creature."';

export default defineCard({
  name: "Clash of Realities",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${SPIRITS}\n${OTHERS}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Spirit" } },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Spirit"] } }],
          effect: {
            kind: "may",
            prompt: "Have this permanent deal 3 damage to the targeted non-Spirit creature?",
            effect: { kind: "damage", amount: 3, target: 0 },
          },
          resolve: null,
          text: "When this permanent enters, you may have it deal 3 damage to target non-Spirit creature.",
        },
      ],
      text: SPIRITS,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", notSubtypes: ["Spirit"] } },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Spirit" } }],
          effect: {
            kind: "may",
            prompt: "Have this creature deal 3 damage to the targeted Spirit creature?",
            effect: { kind: "damage", amount: 3, target: 0 },
          },
          resolve: null,
          text: "When this creature enters, you may have it deal 3 damage to target Spirit creature.",
        },
      ],
      text: OTHERS,
    },
  ],
});
