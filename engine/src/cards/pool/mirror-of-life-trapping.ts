import { defineCard } from "../define.js";

// "If it was cast" can't stop being true, so it's checked as the creature
// enters (rule 603.4). The creature is exiled with this artifact (607.2a);
// then every other permanent card exiled with it returns, under its owner's
// control (610.3c) — the one just exiled stays. A token exiled ceases to
// exist (111.7), so nothing returns for it.

const TEXT =
  "Whenever a creature enters, if it was cast, exile it, then return all other permanent cards exiled with this artifact to the battlefield under their owners' control.";

export default defineCard({
  name: "Mirror of Life Trapping",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature", cast: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object", linked: true },
          {
            kind: "return-exiled-by-source",
            linked: "battlefield",
            others: true,
            filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
