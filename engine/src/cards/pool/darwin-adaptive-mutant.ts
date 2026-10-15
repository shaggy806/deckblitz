import { defineCard } from "../define.js";
import { evolve } from "../helpers.js";

// EDHREC rank 25693.

const INDESTRUCTIBLE_TEXT =
  'Remove two +1/+1 counters from Darwin: He gains indestructible until end of turn. (Damage and effects that say "destroy" don\'t destroy him.)';

export default defineCard({
  name: "Darwin, Adaptive Mutant",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 2,
  toughness: 1,
  text: `Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\n${INDESTRUCTIBLE_TEXT}`,
  triggered: [evolve()],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+1", count: 2 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
});
