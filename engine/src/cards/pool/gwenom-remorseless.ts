import { defineCard } from "../define.js";

// EDHREC rank 2650.
//
// The attack trigger's permissions are a `player-effect` until end of turn,
// lasting whatever becomes of Gwenom: lands played as ever (the land drop,
// the timing), spells cast from the top only for life equal to their mana
// value — an alternative cost (rule 118.9), so no other one goes with it, X is
// 0 (107.3b), additional costs are still paid — as Bolas's Citadel's are (the
// rulings: normal timing, the land drop, no other alternative cost, X 0).

const ATTACK_TEXT =
  "Whenever Gwenom attacks, until end of turn, you may look at the top card of your library any time and you may play cards from the top of your library. If you cast a spell this way, pay life equal to its mana value rather than pay its mana cost.";

export default defineCard({
  name: "Gwenom, Remorseless",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Symbiote", "Spider", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch", "lifelink"],
  text: `Deathtouch, lifelink\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        looksAtOwnLibraryTop: true,
        mayPlay: { from: "library-top", play: true, byPayingLife: true },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
