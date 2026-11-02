import { defineCard } from "../define.js";

export default defineCard({
  name: "Curse of the Werefox",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a Monster Role token attached to target creature you control. When you do, that creature fights up to one target creature you don't control. (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1 and has trample. Creatures that fight each deal damage equal to their power to the other.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Monster Role Token", count: 1, attachedTo: 0 },
      {
        kind: "reflexive-trigger",
        about: 0,
        targets: [{ kind: "optional", of: { kind: "permanent", whose: "opponent", filter: { type: "creature" } } }],
        effect: { kind: "fight", a: "trigger-object", b: 0 },
        text: "When you do, that creature fights up to one target creature you don't control.",
      },
    ],
  },
});
