import { defineCard } from "../define.js";

// Dealt lethal damage at the same time, Otrimi (or a mutate card merged with
// it) is already in the graveyard as the trigger is put on the stack, so it
// can be the target (the ruling).
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, return target creature card with mutate from your graveyard to your hand.";

export default defineCard({
  name: "Otrimi, the Ever-Playful",
  manaCost: "{3}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Nightmare", "Beast"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  mutate: "{1}{B}{G}{U}",
  text: `Mutate {1}{B}{G}{U} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nTrample\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", hasMutate: true } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
