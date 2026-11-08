import { defineCard } from "../define.js";

// EDHREC rank 19662.

const TEXT =
  "Alliance — Whenever another creature you control enters, target creature an opponent controls can't block this turn. If this is the second time this ability has resolved this turn, that creature attacks during its controller's next combat phase if able.";

export default defineCard({
  name: "Sizzling Soloist",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 2 },
            then: { kind: "attack-requirement", target: 0, duration: "during-its-controllers-next-combat" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
