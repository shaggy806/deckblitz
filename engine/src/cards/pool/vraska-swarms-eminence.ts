import { defineCard } from "../define.js";

const GROW_TEXT =
  "Whenever a creature you control with deathtouch deals damage to a player or planeswalker, put a +1/+1 counter on that creature.";
const ASSASSIN_TEXT =
  '−2: Create a 1/1 black Assassin creature token with deathtouch and "Whenever this token deals damage to a planeswalker, destroy that planeswalker."';

// Any damage, not only combat damage. "A player or planeswalker" is one entry
// per kind of recipient, as Grateful Apparition's is; the creature is the
// trigger object, judged as it last existed if it has left.
const grow = (to: "player" | "planeswalker") => ({
  trigger: {
    on: "deals-damage" as const,
    who: "you-control" as const,
    filter: { type: "creature" as const, keyword: "deathtouch" as const },
    to,
  },
  targets: [],
  effect: { kind: "add-counter" as const, target: "trigger-object" as const, counter: "+1/+1", amount: 1 },
  resolve: null,
  text: GROW_TEXT,
});

export default defineCard({
  name: "Vraska, Swarm's Eminence",
  manaCost: "{2}{B/G}{B/G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vraska"],
  loyalty: 5,
  text: `${GROW_TEXT}\n${ASSASSIN_TEXT}`,
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Assassin Token (Vraska, Swarm's Eminence)", count: 1 },
      resolve: null,
      text: ASSASSIN_TEXT,
    },
  ],
  triggered: [grow("player"), grow("planeswalker")],
});
