import { defineCard } from "../define.js";

// EDHREC rank 24044.
//
// Rulings:
//   [2021-11-19] Soulcipher Board's last ability triggers when a creature card is put into a
//     graveyard from anywhere. This is different than an ability that triggers when a creature
//     dies. Notably, a noncreature card on the battlefield that becomes a creature and dies (such
//     as an animated land) won't cause this ability to trigger. Similarly, a creature card on the
//     battlefield that has been made a noncreature permanent (such as one enchanted with Minimus
//     Containment) will cause this ability to trigger when that card is put into your graveyard.
//   [2021-11-19] Token creatures dying never cause Soulcipher Board's last ability to trigger.
//
// "Put one of them into your graveyard" is spelled as its complement: of the
// two looked at, the player picks the one that stays on top and the other
// goes to the graveyard. With only one card left in the library there is
// nothing to keep — that card is the one put into the graveyard — so the
// pick is one card only while the library holds two or more, read as it
// resolves. The trigger is the per-card `put-into-graveyard` (its filter
// read of the card in the graveyard, so it's a creature *card* that counts,
// and tokens never do), then Thing in the Ice's countdown.

const KEEP = { ifCondition: { kind: "library-size", who: "you", atLeast: 2 }, then: 1, else: 0 } as const;

const LOOK_TEXT = "{1}{U}, {T}: Look at the top two cards of your library. Put one of them into your graveyard.";
const OMEN_TEXT =
  "Whenever a creature card is put into your graveyard from anywhere, remove an omen counter from this artifact. Then if it has no omen counters on it, transform it.";

export default defineCard({
  name: "Soulcipher Board",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `This artifact enters with three omen counters on it.\n${LOOK_TEXT}\n${OMEN_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: KEEP,
        max: KEEP,
        destination: "library-top",
        leftover: "graveyard",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "remove-counter", target: "source", counter: "omen", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "omen", compare: { op: "eq", n: 0 } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: OMEN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "omen", amount: 3 } },
      text: "This artifact enters with three omen counters on it.",
    },
  ],
  faces: ["Soulcipher Board", "Cipherbound Spirit"],
  transform: true,
});
