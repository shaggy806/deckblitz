/**
 * Scars of Mirrodin (SOM), batch 3 group B. One test per card whose behaviour
 * is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Heavy Arbalest", () => {
  it("gives the equipped creature a 2-damage tap ability, and it then doesn't untap", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const arbalest = spawn(game, "Heavy Arbalest");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, arbalest, 0, { targets: [ref(bears)] });
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[bears].tapped).toBe(true);
    toStep(game, "precombat-main");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Trigon of Mending", () => {
  it("enters with three charge counters and spends one to give target player 3 life", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const trigon = enter(game, "Trigon of Mending");
    expect(counters(game, trigon, "charge")).toBe(3);
    activate(game, trigon, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(23);
    expect(counters(game, trigon, "charge")).toBe(2);
  });
});

describe("Molder Beast", () => {
  it("gets +2/+0 when a noncreature artifact is put into a graveyard from the battlefield", () => {
    const { game } = table();
    const beast = spawn(game, "Molder Beast");
    const ring = spawn(game, "Sol Ring", B);
    destroy(game, ring);
    expect(pt(game, beast)).toEqual({ power: 7, toughness: 3 });
  });
});

describe("Auriok Sunchaser", () => {
  it("is a 3/3 flier only with metalcraft", () => {
    const { game } = table();
    const sunchaser = spawn(game, "Auriok Sunchaser");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    expect(pt(game, sunchaser)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, sunchaser).has("flying")).toBe(false);
    spawn(game, "Sol Ring");
    expect(pt(game, sunchaser)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, sunchaser).has("flying")).toBe(true);
  });
});

describe("Flesh Allergy", () => {
  it("counts the sacrificed creature and the destroyed target in the life loss", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Flesh Allergy"), { targets: [ref(theirs)], sacrifice: mine });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Wing Puncture", () => {
  it("has your creature deal damage equal to its power to a creature with flying, and only a flier", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const mine = spawn(game, "Grizzly Bears");
    const flier = spawn(game, "Wind Drake", B);
    const ground = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Wing Puncture");
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [ref(mine), ref(ground)] }),
    ).not.toBeNull();
    cast(game, spell, { targets: [ref(mine), ref(flier)] });
    expect(zone(game, flier)).toBe("graveyard");
    expect(game.state.objects[mine].damageMarked).toBe(0);
  });
});

describe("Halt Order", () => {
  it("counters an artifact spell and draws a card", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    const ring = toHand(game, "Sol Ring");
    cast(game, ring, { settle: false });
    const halt = toHand(game, "Halt Order");
    const before = hand(game).length;
    cast(game, halt, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(hand(game).length).toBe(before); // Halt Order left, a card was drawn
  });
});

describe("Molten-Tail Masticore", () => {
  it("is sacrificed at upkeep when its controller declines to discard", () => {
    const { game, a } = table();
    const masticore = spawn(game, "Molten-Tail Masticore");
    a.chooseModesFn = () => [];
    toStep(game, "precombat-main");
    expect(zone(game, masticore)).toBe("graveyard");
  });

  it("stays when its controller discards a card", () => {
    const { game, a } = table();
    const masticore = spawn(game, "Molten-Tail Masticore");
    a.chooseModesFn = () => [0];
    const before = graveyard(game).length;
    toStep(game, "precombat-main");
    expect(zone(game, masticore)).toBe("battlefield");
    expect(graveyard(game).length).toBe(before + 1);
  });

  it("exiles a creature card from your graveyard to deal 4 damage", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const masticore = spawn(game, "Molten-Tail Masticore");
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, masticore, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(zone(game, bears)).toBe("exile");
  });
});
