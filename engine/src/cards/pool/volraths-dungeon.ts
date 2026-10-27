import { defineCard } from "../define.js";

const DESTROY_TEXT = "Pay 5 life: Destroy this enchantment. Any player may activate this ability but only during their turn.";
const PUT_TEXT =
  "Discard a card: Target player puts a card from their hand on top of their library. Activate only as a sorcery.";

export default defineCard({
  name: "Volrath's Dungeon",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${DESTROY_TEXT}\n${PUT_TEXT}`,
  activated: [
    {
      // "During their turn": `your-turn` read from the activator, who
      // controls the ability (rule 602.2a).
      cost: { mana: null, tap: false, payLife: 5 },
      targets: [],
      effect: { kind: "destroy", target: "source" },
      resolve: null,
      anyPlayer: true,
      condition: { kind: "your-turn" },
      text: DESTROY_TEXT,
    },
    {
      // The target player picks the card: a choice they must make, of their
      // own hand, onto their own library.
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        choices: [
          {
            text: "Put a card from your hand on top of your library.",
            effect: {
              kind: "look-and-choose",
              zone: "hand",
              player: "that-player",
              min: 1,
              max: 1,
              destination: "library-top",
              leftover: "stay",
            },
          },
        ],
      },
      resolve: null,
      sorcerySpeed: true,
      text: PUT_TEXT,
    },
  ],
});
