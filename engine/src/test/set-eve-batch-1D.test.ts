/**
 * Eventide (EVE) — group D of the set walk: the hybrid Avatars, a Hedge-Mage,
 * chroma as devotion, and the "another black spell" check.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Dominus of Fealty", () => {
  it("at your upkeep you may take a permanent until end of turn, untapped and hasty", () => {
    const { game, a } = table();
    spawn(game, "Dominus of Fealty");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true, sick: true });
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "draw");
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Edge of the Divinity", () => {
  it("a white creature gets +1/+2", () => {
    const { game } = table();
    const knight = spawn(game, "Serra Angel");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Edge of the Divinity"), { targets: [ref(knight)] });
    expect(pt(game, knight)).toEqual({ power: 5, toughness: 6 });
  });
});

describe("Noggle Ransacker", () => {
  it("each player draws two, then discards one at random", () => {
    const { game } = table();
    const handA = hand(game, A).length;
    const handB = hand(game, B).length;
    enter(game, "Noggle Ransacker");
    expect(hand(game, A)).toHaveLength(handA + 1);
    expect(hand(game, B)).toHaveLength(handB + 1);
    expect(graveyard(game, A)).toHaveLength(1);
    expect(graveyard(game, B)).toHaveLength(1);
  });
});

describe("Primalcrux", () => {
  it("is as big as your devotion to green, its own cost included", () => {
    const { game } = table();
    const crux = spawn(game, "Primalcrux");
    expect(pt(game, crux)).toEqual({ power: 6, toughness: 6 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, crux)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Rise of the Hobgoblins", () => {
  it("pays X for X Goblin Soldiers, and gives red and white creatures first strike", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const mountain = lands(game, "Mountain", 1);
    enter(game, "Rise of the Hobgoblins", A, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(tokensNamed(game, "Goblin Soldier Token", A)).toBe(2);
    expect(game.state.objects[mountain[0]].tapped).toBe(false);
    const rise = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Rise of the Hobgoblins")!;
    const goblin = spawn(game, "Raging Goblin");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, rise, 0);
    expect(keywords(game, goblin).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });
});

describe("Kithkin Zealot", () => {
  it("gains 1 life for each black or red permanent the target opponent controls", () => {
    const { game, a } = table();
    spawn(game, "Hypnotic Specter", B);
    spawn(game, "Raging Goblin", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Raging Goblin", A);
    pickTargets(a, B);
    enter(game, "Kithkin Zealot");
    expect(life(game, A)).toBe(22);
  });
});

describe("Soul Reap", () => {
  it("costs no life on its own", () => {
    const { game } = table();
    const knight = spawn(game, "Serra Angel", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Soul Reap"), { targets: [ref(knight)] });
    expect(zone(game, knight)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("its controller loses 3 if you cast another black spell this turn", () => {
    const { game } = table();
    const knight = spawn(game, "Serra Angel", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Dark Ritual"));
    cast(game, toHand(game, "Soul Reap"), { targets: [ref(knight)] });
    expect(zone(game, knight)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Gwyllion Hedge-Mage", () => {
  it("each ability triggers only with two of its land type", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Gwyllion Hedge-Mage");
    expect(tokensNamed(game, "Kithkin Soldier Token", A)).toBe(1);
    expect(counters(game, bears, "-1/-1")).toBe(0);
    lands(game, "Swamp", 2);
    enter(game, "Gwyllion Hedge-Mage");
    expect(tokensNamed(game, "Kithkin Soldier Token", A)).toBe(2);
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });
});

describe("Marshdrinker Giant", () => {
  it("destroys an Island an opponent controls", () => {
    const { game, a } = table();
    const [island] = lands(game, "Island", 1, B);
    pickTargets(a, island);
    enter(game, "Marshdrinker Giant");
    expect(zone(game, island)).toBe("graveyard");
  });
});

describe("Groundling Pouncer", () => {
  it("activates only while an opponent controls a flyer, once each turn", () => {
    const { game } = table();
    const pouncer = spawn(game, "Groundling Pouncer");
    lands(game, "Forest", 2);
    expect(() => activate(game, pouncer)).toThrow(/refused/);
    spawn(game, "Serra Angel", B);
    activate(game, pouncer);
    expect(pt(game, pouncer)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, pouncer).has("flying")).toBe(true);
    expect(() => activate(game, pouncer)).toThrow(/refused/);
  });
});
