import { defineCard } from "../define.js";

const TEXT =
  "Until end of turn, whenever a creature deals combat damage to you, destroy that creature and create a 2/1 red Klingon Warrior creature token with haste.";

export default defineCard({
  name: "Right of Vengeance",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: { whenever: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "you", combat: true } },
    effect: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: "trigger-object" },
        { kind: "create-token", token: "Klingon Warrior Token", count: 1 },
      ],
    },
    text: "Whenever a creature deals combat damage to you this turn, destroy that creature and create a 2/1 red Klingon Warrior creature token with haste.",
  },
});
