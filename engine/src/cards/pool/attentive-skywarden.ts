import { defineCard } from "../define.js";

// EDHREC rank 13739. March of the Machine.

const TEXT =
  "Whenever this creature deals combat damage to a player or battle, transform up to one target Incubator token you control.";

export default defineCard({
  name: "Attentive Skywarden",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Kor"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
      targets: [
        {
          kind: "optional",
          of: { kind: "permanent", filter: { subtype: "Incubator", token: true, controlledBy: "you" } },
        },
      ],
      effect: { kind: "transform", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
