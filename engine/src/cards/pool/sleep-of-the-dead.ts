import { defineCard } from "../define.js";

// Theros Beyond Death.

export default defineCard({
  name: "Sleep of the Dead",
  manaCost: "{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap target creature. It doesn't untap during its controller's next untap step.\nEscape—{2}{U}, Exile three other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  targets: ["creature"],
  effect: { kind: "tap", target: 0, doesntUntapNext: true },
  escape: { cost: "{2}{U}", exileCount: 3 },
});
