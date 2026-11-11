import { defineCard } from "../define.js";

// "Exile a face-down permanent you control face up" is a cost that exiles the
// one chosen permanent (`exilesSacrifice`: no sacrifice, and it was never
// turned face up, so nothing that watches for either sees it — the ruling).
// "That card" is the paid permanent's card where it now lies in exile; a
// face-down token ceases to exist there, so nothing can be played (the
// ruling). The permission is to play, at the card's own timing and for its
// costs, a land as the turn's land play (the rulings).

const END_TEXT = "At the beginning of your end step, you may manifest the top card of your library.";
const EXILE_TEXT = "Exile a face-down permanent you control face up: You may play that card this turn.";

export default defineCard({
  name: "Primordial Mist",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${END_TEXT} (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)\n${EXILE_TEXT} (You still pay its costs. Timing rules still apply.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "may", prompt: "Manifest the top card of your library?", effect: { kind: "manifest", who: "you" } },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { faceDown: true, controlledBy: "you" } }, exilesSacrifice: true },
      targets: [],
      effect: { kind: "grant-play", cards: { paid: "sacrificed" }, duration: "end-of-turn", play: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
