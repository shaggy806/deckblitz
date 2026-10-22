/**
 * Hour of Devastation, the lead's cards: the aftermath split cards and the
 * exert-cost creatures — the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  hand,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Driven // Despair", () => {
  it("Driven: creatures you control as it resolves gain trample and draw on combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Driven // Despair"), { face: 1 });
    const later = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [bears, later], B);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, B)).toBe(16);
  });
});

describe("Refuse // Cooperate", () => {
  it("Refuse deals the target spell's mana value to its controller", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Island", 3);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    cast(game, toHand(game, "Refuse // Cooperate"), { face: 1, targets: [ref(divination)] });
    expect(life(game, A)).toBe(17);
  });
});

describe("Appeal // Authority", () => {
  it("Appeal gives +X/+X where X is the creatures you control as it resolves", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Appeal // Authority"), { face: 1, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Grind // Dust", () => {
  it("Dust exiles only creatures with -1/-1 counters, any number of them", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Plains", 4);
    const [x, y] = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    const clean = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Grind // Dust");
    cast(game, card, { face: 1, targets: [ref(x), ref(y)] });
    expect([counters(game, x, "-1/-1"), counters(game, y, "-1/-1")]).toEqual([1, 1]);
    expect(() => cast(game, card, { face: 2, via: "aftermath", targets: [ref(clean)] })).toThrow();
    cast(game, card, { face: 2, via: "aftermath", targets: [ref(x), ref(y)] });
    expect([zone(game, x), zone(game, y), zone(game, clean)]).toEqual(["exile", "exile", "battlefield"]);
  });
});

describe("Reason // Believe", () => {
  it("Believe puts a creature card onto the battlefield, or anything into your hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const top = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, top);
    cast(game, toGraveyard(game, "Reason // Believe"), { face: 2, via: "aftermath" });
    expect(zone(game, top)).toBe("battlefield");
  });

  it("Believe puts a noncreature card into your hand", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const top = toLibrary(game, "Island");
    cast(game, toGraveyard(game, "Reason // Believe"), { face: 2, via: "aftermath" });
    expect(zone(game, top)).toBe("hand");
  });
});
