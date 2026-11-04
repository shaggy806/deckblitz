import { defineCard } from "../define.js";

// Face up or face down is chosen as it returns. Face down it's turned face up
// only by its megamorph cost (702.37e), and its enters choice is none (708.3).
const RETURN_TEXT =
  "Whenever a permanent you control is turned face up, you may return this card from your graveyard to the battlefield face up or face down.";

export default defineCard({
  name: "Deathmist Raptor",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Beast"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  morph: { keyword: "megamorph", cost: "{4}{G}" },
  text: `Deathtouch\n${RETURN_TEXT}\nMegamorph {4}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "turned-face-up", who: "you-control" },
      targets: [],
      // "You may": neither mode is the player declining.
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Return it to the battlefield face up", effect: { kind: "put-onto-battlefield", target: "source" } },
          {
            text: "Return it to the battlefield face down",
            effect: { kind: "put-onto-battlefield", target: "source", faceDown: true },
          },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
