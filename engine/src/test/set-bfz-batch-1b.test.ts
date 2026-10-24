/**
 * Battle for Zendikar, group B: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  controller,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Rally — Hero of Goma Fada, Makindi Patrol", () => {
  it("triggers on its own entry and on another Ally's", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Hero of Goma Fada");
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    // Makindi Patrol entering fires its own rally and Hero's.
    nextTurn(game);
    nextTurn(game);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    enter(game, "Makindi Patrol");
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });
});

describe("Grovetender Druids", () => {
  it("pays {1} for a 1/1 green Plant, or makes nothing if declined", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    enter(game, "Grovetender Druids");
    expect(tokensNamed(game, "1/1 Green Plant Token", A)).toBe(1);
    pickModes(a);
    enter(game, "Makindi Patrol");
    expect(tokensNamed(game, "1/1 Green Plant Token", A)).toBe(1);
  });
});

describe("Veteran Warleader", () => {
  it("counts creatures you control and taps another Ally for a keyword chosen on resolution", () => {
    const { game, a } = table();
    const warleader = spawn(game, "Veteran Warleader");
    const ally = spawn(game, "Makindi Patrol");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, warleader)).toEqual({ power: 2, toughness: 2 });
    pickModes(a, 2);
    activate(game, warleader);
    expect(game.state.objects[ally].tapped).toBe(true);
    expect(keywords(game, warleader).has("trample")).toBe(true);
    expect(keywords(game, warleader).has("first-strike")).toBe(false);
  });
});

describe("Aligned Hedron Network", () => {
  it("exiles every creature with power 5 or greater until it leaves", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const network = enter(game, "Aligned Hedron Network");
    expect(zone(game, wurm)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, network);
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Craw Wurm");
    expect(back).toHaveLength(1);
    expect(controller(game, back[0])).toBe(B);
  });
});

describe("Guul Draz Overseer", () => {
  it("+1/+0 to the others, +2/+0 instead for a Swamp, none to itself", () => {
    const { game } = table();
    const overseer = spawn(game, "Guul Draz Overseer");
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Wastes");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    enter(game, "Swamp");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, overseer)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Ingest — Mist Intruder", () => {
  it("the player it hits exiles their top card", () => {
    const { game, a } = table();
    const intruder = spawn(game, "Mist Intruder");
    const top = toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [intruder]);
    expect(life(game, B)).toBe(19);
    expect(zone(game, top)).toBe("exile");
  });
});

describe("Dominator Drone", () => {
  it("drains only if you control another colorless creature", () => {
    const { game } = table();
    enter(game, "Dominator Drone");
    expect(life(game, B)).toBe(20);
    enter(game, "Dominator Drone");
    expect(life(game, B)).toBe(18);
  });
});

describe("Dust Stalker", () => {
  it("returns at an end step if you control no other colorless creature", () => {
    const { game } = table();
    const stalker = spawn(game, "Dust Stalker");
    nextTurn(game);
    expect(zone(game, stalker)).toBe("hand");
  });

  it("stays beside another colorless creature", () => {
    const { game } = table();
    const stalker = spawn(game, "Dust Stalker");
    spawn(game, "Blisterpod");
    nextTurn(game);
    expect(zone(game, stalker)).toBe("battlefield");
  });
});

describe("Converge — Radiant Flames, Exert Influence, Roilmage's Trick", () => {
  it("Radiant Flames deals damage equal to the colours spent", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Radiant Flames"));
    // Two colours (Wastes makes colourless): 2 to each creature.
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("Exert Influence takes a creature whose power is at most the colours spent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Exert Influence"), { targets: [{ kind: "object", object: bears }] });
    expect(controller(game, bears)).toBe(A);
  });

  it("Exert Influence does nothing to a bigger one", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Exert Influence"), { targets: [{ kind: "object", object: giant }] });
    expect(controller(game, giant)).toBe(B);
  });

  it("Roilmage's Trick gives opponents' creatures -X/-0 and draws", () => {
    const { game } = table();
    const theirs = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Roilmage's Trick"));
    expect(pt(game, theirs)).toEqual({ power: 0, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Nettle Drone", () => {
  it("pings each opponent and untaps when you cast a colorless spell", () => {
    const { game } = table();
    const drone = spawn(game, "Nettle Drone");
    activate(game, drone);
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[drone].tapped).toBe(true);
    cast(game, toHand(game, "Ornithopter"));
    expect(game.state.objects[drone].tapped).toBe(false);
  });
});

describe("Kor Castigator", () => {
  it("can't be blocked by an Eldrazi Scion, but can by another Eldrazi", () => {
    const { game, a } = table();
    const castigator = spawn(game, "Kor Castigator");
    const scion = spawn(game, "Eldrazi Scion Token", B);
    const drone = spawn(game, "Blisterpod", B);
    const offer = blockOffer(game, a, [castigator]);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toContain(drone);
    expect(blockers).not.toContain(scion);
  });
});

describe("Noyan Dar, Roil Shaper", () => {
  it("an instant cast animates a land with three +1/+1 counters", () => {
    const { game, a } = table();
    spawn(game, "Noyan Dar, Roil Shaper");
    const [land] = lands(game, "Mountain", 1);
    pickModes(a, 0);
    pickTargets(a, land);
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    expect(pt(game, land)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, land).has("haste")).toBe(true);
  });
});
