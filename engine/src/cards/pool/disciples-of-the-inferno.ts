import { defineCard } from "../define.js";

// The back face of Invasion of Regatha.
//
// "A creature, battle, or opponent" is two `would-deal-damage` statics over
// one source filter: one to an opponent, one to a creature or battle on the
// battlefield (anyone's, yours too). No damage event reaches both, so each is
// added once, per recipient, after the damage is divided or assigned (rule
// 616.1 orders it among other replacements). A noncreature source is read as
// it is, or as it last existed if it has left.
const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const TEXT =
  "If a noncreature source you control would deal damage to a creature, battle, or opponent, it deals that much damage plus 2 instead.";
const SOURCE = { notTypes: ["creature"], controlledBy: "you" } as const;

export default defineCard({
  name: "Disciples of the Inferno",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 4,
  toughness: 4,
  text: `${PROWESS_TEXT}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", instead: { modify: { plus: 2 } }, source: SOURCE, to: "opponent" },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { modify: { plus: 2 } },
        source: SOURCE,
        toFilter: { typesAnyOf: ["creature", "battle"] },
      },
      text: TEXT,
    },
  ],
  faces: ["Invasion of Regatha", "Disciples of the Inferno"],
  transform: true,
});
