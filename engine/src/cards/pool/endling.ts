import { defineCard } from "../define.js";
import { undying } from "../helpers.js";

// EDHREC rank 17221.
//
// Rulings:
//   [2019-06-14] If you activate Endling's last ability, you don't choose whether Endling gets
//     +1/-1 or -1/+1 until that ability resolves.
//   [2019-06-14] Once undying returns the creature, it's considered a new object with no relation
//     to the object that it was. Auras that were attached to it won't return to the battlefield.
//     Equipment that was attached to it will remain unattached. Any counters that were on it won't
//     be put on the new creature.
//   [2019-06-14] If a creature has multiple instances of undying, they'll each trigger separately,
//     but once one of those abilities returns the card to the battlefield, any others will have no
//     effect. The creature won't receive multiple +1/+1 counters.
//   [2019-06-14] If Endling's last ability gives it -1/+1 enough times, it may have negative
//     power. Use that negative value if its power is further modified.
// Undying until end of turn is Undying Evil's grant; the last ability's
// choice is a `modal` effect, chosen as it resolves (Pemmin's Aura's shape).

const MENACE = "{B}: This creature gains menace until end of turn.";
const DEATHTOUCH = "{B}: This creature gains deathtouch until end of turn.";
const UNDYING = "{B}: This creature gains undying until end of turn.";
const SWAP = "{1}: This creature gets +1/-1 or -1/+1 until end of turn.";

export default defineCard({
  name: "Endling",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Shapeshifter"],
  power: 3,
  toughness: 3,
  text: `${MENACE}\n${DEATHTOUCH}\n${UNDYING} (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)\n${SWAP}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
      resolve: null,
      text: MENACE,
    },
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: DEATHTOUCH,
    },
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "grant-triggered", target: "source", duration: "end-of-turn", ability: undying() },
      resolve: null,
      text: UNDYING,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "This creature gets +1/-1 until end of turn.",
            effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
          },
          {
            text: "This creature gets -1/+1 until end of turn.",
            effect: { kind: "modify-pt", target: "source", power: -1, toughness: 1, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: SWAP,
    },
  ],
});
