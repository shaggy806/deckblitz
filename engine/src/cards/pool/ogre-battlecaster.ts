import { defineCard } from "../define.js";

// "By paying {R}{R} in addition to its other costs" is a
// `cast-now`'s `alsoPaying`, so X is announced as usual. "When you cast that
// spell" triggers off the cast and goes on the stack above the spell, once this
// trigger has finished resolving (rule 603.3), which is a `reflexive-trigger` in
// the `cast-now`'s `then`; its X is read as the spell is cast, on the stack.
const ATTACK_TEXT =
  "Whenever this creature attacks, you may cast target instant or sorcery card from your graveyard by paying {R}{R} in addition to its other costs. If that spell would be put into a graveyard, exile it instead. When you cast that spell, this creature gets +X/+0 until end of turn, where X is that spell's mana value.";

export default defineCard({
  name: "Ogre Battlecaster",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: {
        kind: "cast-now",
        target: 0,
        alsoPaying: "{R}{R}",
        exileAfter: true,
        then: {
          kind: "reflexive-trigger",
          targets: [],
          value: { thisWay: "cast", sumOf: "mana-value" },
          effect: {
            kind: "modify-pt",
            target: "source",
            power: { triggerValue: true },
            toughness: 0,
            duration: "end-of-turn",
          },
          text: "When you cast that spell, this creature gets +X/+0 until end of turn, where X is that spell's mana value.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
