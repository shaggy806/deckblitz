import { defineCard } from "../define.js";

// Feather, the Redeemed's replacement, plotting the card: only a spell that
// resolves is exiled (one countered goes to the graveyard), and only a card
// you own; "if you do" — another replacement applied first instead (rule
// 616.1) exiles it unplotted.
const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const PLOT_TEXT =
  "Whenever you cast a multicolored instant or sorcery spell from your hand, exile that spell instead of putting it into your graveyard as it resolves. If you do, it becomes plotted.";

export default defineCard({
  name: "Lilah, Undefeated Slickshot",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${PROWESS_TEXT}\n${PLOT_TEXT} (You may cast it as a sorcery on a later turn without paying its mana cost.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["instant", "sorcery"], multicolored: true, castFrom: "hand" },
      },
      targets: [],
      effect: { kind: "exile-spell-as-it-resolves", plotted: true },
      resolve: null,
      text: PLOT_TEXT,
    },
  ],
});
