/**
 * Urza's Saga (USG) — batch 2, group D.
 */
import { describe, expect, it } from "vitest";

import {
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  lands,
  nextTurn,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Venomous Fangs", () => {
  it("destroys a creature the enchanted creature deals noncombat damage to", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Venomous Fangs"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Prey Upon"), { targets: [ref(bears), ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Hidden Predators", () => {
  it("becomes a 4/4 Beast once an opponent controls a creature with power 4 or greater", () => {
    const { game } = table();
    const predators = spawn(game, "Hidden Predators");
    enter(game, "Grizzly Bears", B);
    expect(types(game, predators)).toEqual(["enchantment"]);
    enter(game, "Craw Wurm", B);
    expect(types(game, predators)).toEqual(["creature"]);
    expect(subtypes(game, predators)).toEqual(["Beast"]);
    expect(pt(game, predators)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Waylay", () => {
  it("makes three Knights that are exiled at the next cleanup step", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Waylay"));
    expect(tokensNamed(game, "2/2 White Knight Token")).toBe(3);
    toStep(game, "end");
    expect(tokensNamed(game, "2/2 White Knight Token")).toBe(3);
    nextTurn(game);
    expect(tokensNamed(game, "2/2 White Knight Token")).toBe(0);
  });
});

describe("Wizard Mentor", () => {
  it("returns itself and the target creature you control to hand", () => {
    const { game } = table();
    const mentor = spawn(game, "Wizard Mentor");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, mentor, 0, { targets: [ref(bears)] });
    expect(zone(game, mentor)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Vebulid", () => {
  it("enters with a counter and is destroyed at end of combat after attacking", () => {
    const { game, a } = table();
    const vebulid = enter(game, "Vebulid");
    expect(counters(game, vebulid)).toBe(1);
    attack(game, a, [vebulid]);
    expect(zone(game, vebulid)).toBe("graveyard");
  });
});

describe("Skittering Skirge", () => {
  it("is sacrificed when you cast a creature spell", () => {
    const { game } = table();
    const skirge = spawn(game, "Skittering Skirge");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, skirge)).toBe("graveyard");
  });
});
