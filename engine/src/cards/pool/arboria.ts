import { defineCard } from "../define.js";

// EDHREC rank 18397. A restriction on each attack at a player (rule 508.1c),
// asked of the player who'd be attacked, "you" read as them: the journal's
// spells they cast, and nontoken permanents that entered under their control,
// during their own most recent turn (a land played is one). Their
// planeswalkers and battles may still be attacked: it names the player alone.
// A player with no last turn yet did neither, so can't be attacked.
const TEXT =
  "Creatures can't attack a player unless that player cast a spell or put a nontoken permanent onto the battlefield during their last turn.";

export default defineCard({
  name: "Arboria",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      restrictions: [
        {
          kind: "cant-attack",
          at: {
            defender: {
              holds: {
                kind: "not",
                of: {
                  kind: "any",
                  of: [
                    { kind: "turn-history", what: "spells-cast", who: "you", window: "your-last-turn" },
                    { kind: "turn-history", what: "entered", who: "you", window: "your-last-turn", filter: { token: false } },
                  ],
                },
              },
            },
          },
        },
      ],
      text: TEXT,
    },
  ],
});
