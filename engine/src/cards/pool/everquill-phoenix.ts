import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  'Whenever this creature mutates, create a red artifact token named Feather with "{1}, Sacrifice this token: Return target Phoenix card from your graveyard to the battlefield tapped."';

export default defineCard({
  name: "Everquill Phoenix",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  mutate: "{3}{R}",
  text: `Mutate {3}{R} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Feather Token", count: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
