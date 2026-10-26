import { defineCard } from "../define.js";

// Ruling: once a creature has blocked it, the trigger doesn't make it unblocked.

const TEXT =
  "Whenever another artifact you control enters, this creature gets +1/+1 until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Glassdust Hulk",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 4,
  cycling: { cost: "{W/U}" },
  text: `${TEXT}\nCycling {W/U} ({W/U}, Discard this card: Draw a card.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
