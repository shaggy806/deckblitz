import { defineCard } from "../define.js";

export default defineCard({
  name: "Back for More",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: "Return target creature card from your graveyard to the battlefield. When you do, it fights up to one target creature you don't control. (Each deals damage equal to its power to the other.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "reflexive-trigger",
        about: "put-this-way",
        targets: [{ kind: "optional", of: { kind: "permanent", whose: "opponent", filter: { type: "creature" } } }],
        effect: { kind: "fight", a: "trigger-object", b: 0 },
        text: "When you do, it fights up to one target creature you don't control.",
      },
    ],
  },
});
