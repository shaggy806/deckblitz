import { defineCard } from "../define.js";

const ETB_TEXT = "When Silver Sable enters, put a +1/+1 counter on another target creature.";
const ATTACK_TEXT =
  "Whenever Silver Sable attacks, target modified creature you control gains lifelink until end of turn. (Equipment, Auras you control, and counters are modifications.)";

export default defineCard({
  name: "Silver Sable, Mercenary Leader",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Hero"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      // `modified` is rule 700.9 as the rulings read it: any counter, any
      // Equipment, or an Aura its own controller controls.
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", modified: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
