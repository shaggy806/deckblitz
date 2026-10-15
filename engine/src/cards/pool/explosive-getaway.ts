import { defineCard } from "../define.js";

export default defineCard({
  name: "Explosive Getaway",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Exile up to one target artifact or creature. Return it to the battlefield under its owner's control at the beginning of the next end step.\nExplosive Getaway deals 4 damage to each creature.",
  targets: [{ kind: "optional", of: { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      { kind: "damage-all", amount: 4, filter: { type: "creature" } },
    ],
  },
});
