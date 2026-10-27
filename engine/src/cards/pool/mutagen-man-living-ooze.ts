import { defineCard } from "../define.js";

const COST_TEXT = "Activated abilities of artifact tokens you control cost {1} less to activate.";

export default defineCard({
  name: "Mutagen Man, Living Ooze",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ooze", "Mutant"],
  power: 2,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${COST_TEXT}\nWhen Mutagen Man enters, create X Mutagen tokens. (They're artifacts with "{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.")`,
  static: [
    {
      // Generic mana only, down to {0} (the ruling).
      affects: { scope: "self" },
      abilityCostModification: { applies: { type: "artifact", token: true, controlledBy: "you" }, reduceGeneric: 1 },
      text: COST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: "x" },
      resolve: null,
      text: "When Mutagen Man enters, create X Mutagen tokens.",
    },
  ],
});
