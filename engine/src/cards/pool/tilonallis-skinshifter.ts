import { defineCard } from "../define.js";

// EDHREC rank 23673.
//
// Rulings: it copies the target's copiable values (rule 707.2) — not its
// counters or other effects — and keeps them until end of turn even if the
// target changes or leaves; an illegal target leaves it a 0/1 attacker.
// Attack triggers it copies don't fire (attackers are already declared), and
// if the copy isn't a creature it's removed from combat (rule 506.4).

const TEXT =
  "Whenever this creature attacks, it becomes a copy of another target nonlegendary attacking creature until end of turn.";

export default defineCard({
  name: "Tilonalli's Skinshifter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 0,
  toughness: 1,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "permanent", filter: { type: "creature", attacking: true, notSupertype: "legendary" } },
        },
      ],
      effect: { kind: "become-copy", target: "source", of: 0, until: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
