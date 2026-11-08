import { defineCard } from "../define.js";

const ETB = "When Wolverine enters, he fights up to one other target creature.";
const HEAL = "If damage would be dealt to Wolverine, instead that damage is dealt, but all other damage already dealt to him is healed.";

export default defineCard({
  name: "Wolverine, Fierce Fighter",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Mutant", "Berserker", "Hero"],
  power: 3,
  toughness: 5,
  keywords: ["haste"],
  text: `Haste\n${ETB}\n${HEAL}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature", than: "source" } }],
      effect: { kind: "fight", a: "source", b: 0 },
      resolve: null,
      text: ETB,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "self", instead: { modify: {}, also: { kind: "heal", target: "source" } } },
      text: HEAL,
    },
  ],
});
