import { defineCard } from "../define.js";
// EDHREC rank 17595.
//
// The upkeep ability isn't printed on the card: it's given by the copy exception (rule 707.9a),
// so an uncopied Doppelganger (a 0/0) doesn't have it, and the ability's own "and it has this
// ability" names it there (`thisAbility.inCopyOnEnter`). "Doesn't copy that creature's color"
// keeps the colours its copiable values had (rule 707.9c): blue, which a copy of it copies too.
// It may become a copy of itself, gaining another instance of the ability (the ruling), and it
// doesn't leave the battlefield as it changes, keeping its damage (rule 707.4).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may have this creature become a copy of target creature, except it doesn't copy that creature's color and it has this ability.";
const TEXT = `You may have this creature enter as a copy of any creature on the battlefield, except it doesn't copy that creature's color and it has "${UPKEEP_TEXT}"`;
export default defineCard({
  name: "Vesuvan Doppelganger",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 0,
  text: TEXT,
  copyOnEnter: {
    filter: { type: "creature" },
    except: {
      keepOwnColors: true,
      triggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: ["creature"],
          effect: {
            kind: "may",
            prompt: "Have this creature become a copy of target creature, except it doesn't copy that creature's color and it has this ability?",
            effect: {
              kind: "become-copy",
              target: "source",
              of: 0,
              exceptions: {
                keepOwnColors: true,
                thisAbility: { card: "Vesuvan Doppelganger", triggered: 0, inCopyOnEnter: true },
              },
            },
          },
          resolve: null,
          text: UPKEEP_TEXT,
        },
      ],
    },
  },
});
