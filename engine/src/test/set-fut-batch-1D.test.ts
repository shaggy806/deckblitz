/**
 * Future Sight (FUT) — group D of the set walk: a self-suspending burn
 * spell, an echo {0} payoff, a flicker on every other creature's entry, a
 * cost reduction while tapped and the scry-then-reveal creatures.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Arc Blade", () => {
  it("deals 2 damage, then exiles itself suspended with three time counters", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const blade = toHand(game, "Arc Blade");
    cast(game, blade, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, blade)).toBe("exile");
    expect(game.state.objects[blade].counters.time ?? 0).toBe(3);
    expect(game.state.objects[blade].suspended).toBe(true);
  });
});

describe("Saltskitter", () => {
  it("is exiled when another creature enters and returns at the next end step", () => {
    const { game } = table();
    const wurm = spawn(game, "Saltskitter");
    enter(game, "Grizzly Bears", B);
    expect(zone(game, wurm)).toBe("exile");
    toStep(game, "cleanup");
    expect(tokensNamed(game, "Saltskitter")).toBe(0);
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Saltskitter")).toBe(true);
  });
});

describe("Centaur Omenreader", () => {
  it("makes creature spells cost {2} less only while it's tapped", () => {
    const { game } = table();
    const reader = spawn(game, "Centaur Omenreader");
    lands(game, "Forest", 1);
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears)).toThrow();
    game.state.objects[reader].tapped = true;
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Llanowar Mentor", () => {
  it("discards a card to make a Llanowar Elves token that taps for {G}", () => {
    const { game } = table();
    const mentor = spawn(game, "Llanowar Mentor");
    lands(game, "Forest", 1);
    const before = hand(game).length;
    activate(game, mentor);
    expect(hand(game).length).toBe(before - 1);
    expect(tokensNamed(game, "Llanowar Elves Token")).toBe(1);
  });
});

describe("Llanowar Empath", () => {
  it("puts a revealed creature card into its controller's hand", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    enter(game, "Llanowar Empath");
    expect(zone(game, bears)).toBe("hand");
  });

  it("leaves a noncreature card on top", () => {
    const { game } = table();
    const top = toLibrary(game, "Forest");
    enter(game, "Llanowar Empath");
    expect(zone(game, top)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(top);
  });
});

describe("Putrid Cyclops", () => {
  it("gets -X/-X where X is the revealed card's mana value", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears");
    const cyclops = enter(game, "Putrid Cyclops");
    expect(pt(game, cyclops)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Shah of Naar Isle", () => {
  it("pays echo {0}, then each opponent may draw up to three cards", () => {
    const { game, a, b } = table();
    const shah = enter(game, "Shah of Naar Isle");
    toStep(game, "draw", B);
    toStep(game, "upkeep");
    const before = hand(game, B).length;
    pickModes(a, 0);
    // Bob says yes to drawing, then picks "Draw two cards."
    const answers = [[0], [1]];
    b.chooseModesFn = () => answers.shift() ?? [];
    settle(game);
    expect(zone(game, shah)).toBe("battlefield");
    expect(hand(game, B).length).toBe(before + 2);
  });

  it("is sacrificed when echo isn't paid, and nobody draws", () => {
    const { game, a } = table();
    const shah = enter(game, "Shah of Naar Isle");
    toStep(game, "draw", B);
    toStep(game, "upkeep");
    const before = hand(game, B).length;
    pickModes(a);
    settle(game);
    expect(zone(game, shah)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before);
  });
});
