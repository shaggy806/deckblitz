import { defineCard } from "../define.js";

export default defineCard({
  name: "Moonmist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Transform all Humans. Prevent all combat damage that would be dealt this turn by creatures other than Werewolves and Wolves. (Only double-faced cards can be transformed.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-permanent",
        filter: { subtype: "Human" },
        simultaneous: true,
        effect: { kind: "transform", target: 0 },
      },
      {
        kind: "prevent-all-combat-damage",
        by: { type: "creature", not: { anyOf: [{ subtype: "Werewolf" }, { subtype: "Wolf" }] } },
      },
    ],
  },
});
