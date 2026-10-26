/**
 * Saviors of Kamigawa (SOK; B197) — group C: hand-size cards, bushido, channel and Spirit /
 * Arcane triggers.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  lands,
  life,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  nextTurn,
  zone,
} from "./harness.js";

describe("Ideas Unbound", () => {
  it("draws three now and discards three at the next end step", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const card = toHand(game, "Ideas Unbound");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before - 1 + 3);
    nextTurn(game);
    expect(hand(game, A).length).toBe(before - 1);
  });
});

describe("Kagemaro, First to Suffer", () => {
  it("is as big as its controller's hand, and its sacrifice shrinks every creature by that much", () => {
    const { game } = table();
    const kagemaro = spawn(game, "Kagemaro, First to Suffer");
    const n = hand(game).length;
    expect(pt(game, kagemaro)).toEqual({ power: n, toughness: n });
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 1);
    activate(game, kagemaro);
    expect(zone(game, kagemaro)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Haru-Onna", () => {
  it("returns to hand when its controller casts an Arcane spell, before that spell resolves", () => {
    const { game, a } = table();
    const haru = spawn(game, "Haru-Onna");
    pickModes(a, 0);
    lands(game, "Mountain", 4);
    const embers = toHand(game, "Spiraling Embers");
    cast(game, embers, { targets: [ref(B)] });
    expect(zone(game, haru)).toBe("hand");
    // Haru-Onna's trigger resolved first, so the Embers counted it in hand.
    expect(life(game, B)).toBe(20 - hand(game).length);
  });
});

describe("Descendant of Soramaro", () => {
  it("looks at as many cards as its controller has in hand", () => {
    const { game, a } = table();
    const descendant = spawn(game, "Descendant of Soramaro");
    lands(game, "Island", 2);
    const n = hand(game).length;
    let offered = -1;
    a.chooseFromZoneFn = (_view, eligible, min) => {
      offered = eligible.length;
      return eligible.slice(0, min);
    };
    activate(game, descendant);
    expect(offered).toBe(n);
  });
});

describe("Shape Stealer", () => {
  it("becomes the blocking creature's size", () => {
    const { game, a, b } = table();
    const stealer = spawn(game, "Shape Stealer");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: stealer }];
    attack(game, a, [stealer]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, stealer)).toBe("graveyard");
  });
});

describe("Jiwari, the Earth Aflame", () => {
  it("channel deals X to each creature without flying", () => {
    const { game } = table();
    const jiwari = toHand(game, "Jiwari, the Earth Aflame");
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const crow = spawn(game, "Storm Crow", B);
    activate(game, jiwari, 1, { x: 2 });
    expect(zone(game, jiwari)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, crow)).toBe("battlefield");
  });
});

describe("Oni of Wild Places", () => {
  it("returns a red creature its controller chooses at upkeep", () => {
    const { game, a } = table();
    const oni = spawn(game, "Oni of Wild Places");
    const goblin = spawn(game, "Raging Goblin");
    pickPermanents(a, goblin);
    toStep(game, "precombat-main");
    expect(zone(game, goblin)).toBe("hand");
    expect(zone(game, oni)).toBe("battlefield");
  });
});
