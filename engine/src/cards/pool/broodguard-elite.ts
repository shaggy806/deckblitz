import { defineCard } from "../define.js";

// EDHREC rank 7652.
//
// Rulings:
//   [2025-07-25] In some unusual cases, you may end up putting the appropriate counters on more
//     than one permanent. For example, if you control The Ozolith (a card from the Ikoria: Lair of
//     Behemoths set) when Broodguard Elite leaves the battlefield, you’ll put the appropriate
//     number of each kind of counter onto both The Ozolith and the target creature.
//   [2025-07-25] Broodguard Elite’s second ability puts all counters that were on Broodguard Elite
//     onto the target creature, not just its +1/+1 counters.
//   [2025-07-25] Broodguard Elite’s second ability doesn’t cause you to move counters from
//     Broodguard Elite onto the target creature. Rather, you put the same number of each kind of
//     counter Broodguard Elite had when it left the battlefield onto the target creature.
//   [2025-07-25] If enough -1/-1 counters are put on Broodguard Elite at the same time to make its
//     toughness 0 or less, its second ability will see all of the +1/+1 counters it had when it
//     died as well as the -1/-1 counters it had, and an equal number of each of those types of
//     counters (plus any other applicable counters) will be put onto the target creature.
//   [2025-07-25] If Broodguard Elite has -1/-1 counters on it when it leaves the battlefield, that
//     ability will include those as well. This may result in the recipient of the counters dying.

export default defineCard({
  name: "Broodguard Elite",
  manaCost: "{X}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Knight"],
  power: 0,
  toughness: 0,
  text: "This creature enters with X +1/+1 counters on it.\nWhen this creature leaves the battlefield, put its counters on target creature you control.\nWarp {X}{G} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)",
  triggered: [
    {
      // Each kind it had as it left, put on rather than moved (rule 122.8,
      // the ruling) — -1/-1 counters too.
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "put-counters-of", of: "source", target: 0 },
      resolve: null,
      text: "When this creature leaves the battlefield, put its counters on target creature you control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
  warp: { cost: "{X}{G}" },
});
