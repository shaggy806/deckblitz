import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever a modified creature you control attacks, double the number of each kind of counter on it. Then for each nontoken permanent attached to it, create a token that's a copy of that permanent attached to that creature.";

// EDHREC rank 7641. Modified is the `modified` filter (rule 700.9: counters,
// Equipment anyone controls, Auras you control). The copies are created under
// your control attached to the attacking creature (`attachedTo`): an Aura
// copy that can't enchant it isn't created, an Equipment copy that can't
// equip it enters unattached (the rulings). What's attached is read as the
// trigger resolves, as it last was if the creature has left (rule 608.2h).
export default defineCard({
  name: "Arna Kennerüd, Skycaptain",
  manaCost: "{2}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\nWard—Discard a card.\n${ATTACK_TEXT}`,
  triggered: [
    ward({ discard: 1 }),
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", modified: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "double-counters", target: "trigger-object" },
          {
            kind: "create-token-copy",
            of: { attachmentsOf: "trigger-object" },
            ofMatching: { token: false },
            count: 1,
            who: "you",
            attachedTo: "trigger-object",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
