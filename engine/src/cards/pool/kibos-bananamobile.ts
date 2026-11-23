import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// Playtest card (Mystery Booster 2). The Bananas are Kibo, Uktabi Prince's
// Banana tokens. "Have it deal 2 damage": the sacrificed Banana is the
// source, as it last existed (rule 608.2h).

const BANANAS =
  'When this Vehicle enters, create three colorless artifact tokens named Banana with "{T}, Sacrifice this token: Add {R} or {G}. You gain 2 life."';
const SACRIFICE = "Whenever you sacrifice a Banana, you may have it deal 2 damage to target attacking creature.";

export default defineCard({
  name: "Kibo's Bananamobile",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  text: `${BANANAS}\n${SACRIFICE}\nCrew 1`,
  activated: [crew(1)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Banana Token", count: 3 },
      resolve: null,
      text: BANANAS,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { name: "Banana Token" } },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "may",
        prompt: "Have the Banana deal 2 damage to the targeted attacking creature?",
        effect: { kind: "damage", amount: 2, target: 0, from: "trigger-object" },
      },
      resolve: null,
      text: SACRIFICE,
    },
  ],
});
