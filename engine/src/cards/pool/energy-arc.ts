import { defineCard } from "../define.js";

export default defineCard({
  name: "Energy Arc",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Untap any number of target creatures. Prevent all combat damage that would be dealt to and dealt by those creatures this turn.",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "untap", target: 0 },
        { kind: "damage-rule", to: { target: 0 }, combat: true },
        { kind: "damage-rule", by: { target: 0 }, combat: true },
      ],
    },
  },
});
