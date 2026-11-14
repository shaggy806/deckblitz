import { defineCard } from "../define.js";

// EDHREC rank 9930. A villainous choice (rule 701.55) per target, faced by
// that creature's controller: the players facing them go one at a time in
// turn order, each choice carried out before the next is made (701.55d —
// `for-each-target` orders them so, whatever order the targets were chosen
// in), one player's several in target order. A target gone illegal brings no
// choice. "Becomes a 1/1 white Human creature" with no duration is for good,
// and replaces its card types, creature types and colors (rule 205.1a). The
// token copy is the caster's ("you" in either option is the spell's
// controller).

const TEXT =
  "Choose up to four target creatures you don't control. For each of them, that creature's controller faces a villainous choice — That creature becomes a 1/1 white Human creature and loses all abilities, or you create a token that's a copy of it.";

export default defineCard({
  name: "Hunted by The Family",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "any-number", of: "creature-an-opponent-controls", max: 4 }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "each-player-may",
      villainous: true,
      who: { controllerOf: 0 },
      choices: [
        {
          text: "That creature becomes a 1/1 white Human creature and loses all abilities.",
          effect: {
            kind: "become",
            target: 0,
            setTypes: ["creature"],
            setSubtypes: ["Human"],
            setColors: ["W"],
            power: 1,
            toughness: 1,
            loseAbilities: true,
            duration: "permanent",
          },
        },
        {
          text: "You create a token that's a copy of that creature.",
          effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
        },
      ],
    },
  },
});
