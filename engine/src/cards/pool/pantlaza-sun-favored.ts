import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 2466.
//
// "Pantlaza or another Dinosaur you control enters" is two triggers
// (`thisOrAnother`'s shape: its own entry, whatever it is then, and every
// other Dinosaur's), counted as the one ability they are (`sameAbilityAs`),
// so "do this only once each turn" spans both: a `may` with `oncePerTurn`,
// which stops offering itself once the discover has been chosen this turn
// (the ruling) — a declined one doesn't count. X is the entering creature's
// toughness as the ability resolves, as it last existed if it has left (the
// ruling).
const TEXT =
  "Whenever Pantlaza or another Dinosaur you control enters, you may discover X, where X is that creature's toughness. Do this only once each turn. (Exile cards from the top of your library until you exile a nonland card with that mana value or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)";

const DISCOVER: Omit<TriggeredAbility, "trigger"> = {
  targets: [],
  effect: {
    kind: "may",
    prompt: "Discover X, where X is that creature's toughness?",
    oncePerTurn: true,
    effect: { kind: "discover", amount: { toughnessOf: "trigger-object" } },
  },
  resolve: null,
  text: TEXT,
};

export default defineCard({
  name: "Pantlaza, Sun-Favored",
  manaCost: "{2}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    { ...DISCOVER, trigger: { on: "enters-battlefield", who: "self" } },
    {
      ...DISCOVER,
      trigger: { on: "enters-battlefield", who: "you-control", otherOnly: true, filter: { subtype: "Dinosaur" } },
      sameAbilityAs: 0,
    },
  ],
});
