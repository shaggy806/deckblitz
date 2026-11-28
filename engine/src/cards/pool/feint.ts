import { defineCard } from "../define.js";

// EDHREC rank 29195. "Creatures blocking target attacking creature" is a
// filter on what that target slot holds as the spell resolves (rule 608.2h):
// the blockers are found then, tapped, and each given a prevention shield of
// its own lasting this turn, as is the attacker. A blocker tapped this way
// stays blocking and still deals its combat damage (rule 506.4b), so the
// shields are what stop it.

const TEXT =
  "Tap all creatures blocking target attacking creature. Prevent all combat damage that would be dealt this turn " +
  "by that creature and each creature blocking it.";

const blockingIt = { type: "creature", blockingRelation: { relation: "blocking", of: 0 } } as const;

export default defineCard({
  name: "Feint",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap-all", filter: blockingIt },
      { kind: "damage-rule", by: { target: 0 }, combat: true },
      {
        kind: "for-each-permanent",
        filter: blockingIt,
        as: 1,
        effect: { kind: "damage-rule", by: { target: 1 }, combat: true },
      },
    ],
  },
});
